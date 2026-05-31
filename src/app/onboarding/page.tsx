'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { uploadRewardImage, saveUserRewardsConfig, RewardConfig } from '@/lib/rewards-storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/I18nProvider'

type OnboardingStep = 
  | 'welcome' 
  | 'reward-type' 
  | 'reward-count' 
  | 'upload-rewards' 
  | 'saving'

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [rewardType, setRewardType] = useState<'virtual' | 'real' | null>(null)
  const [rewardCount, setRewardCount] = useState<number>(3)
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0)
  const [rewards, setRewards] = useState<Array<{ name: string, file: File | null, preview: string }>>([])
  
  const [isGuest, setIsGuest] = useState(false)
  const [ready, setReady] = useState(false)

  const router = useRouter()
  const user = auth.currentUser
  const { t } = useI18n()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsGuest(localStorage.getItem('guestMode') === 'true')
      setReady(true)
    }
  }, [])

  // --- Back navigation helper ---
  const goBack = () => {
    switch (step) {
      case 'reward-type':
        setStep('welcome')
        break
      case 'reward-count':
        setStep('reward-type')
        break
      case 'upload-rewards':
        if (currentRewardIndex > 0) {
          setCurrentRewardIndex(prev => prev - 1)
        } else {
          setStep('reward-count')
        }
        break
      default:
        break
    }
  }

  // --- Handlers for each step ---

  const handleWelcomeNext = () => setStep('reward-type')

  const handleSelectType = async (type: 'virtual' | 'real') => {
    setRewardType(type)
    if (type === 'virtual') {
      setStep('saving')
      if (isGuest) {
        localStorage.setItem('guestOnboardingComplete', 'true')
        localStorage.setItem('rewardsType', 'virtual')
        router.replace('/')
      } else {
        await saveUserRewardsConfig(user!.uid, 'virtual')
        router.replace('/')
      }
    } else {
      setStep('reward-count')
    }
  }

  const handleSelectCount = (count: number) => {
    setRewardCount(count)
    setRewards(Array.from({ length: count }, () => ({ name: '', file: null, preview: '' })))
    setStep('upload-rewards')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const newRewards = [...rewards]
      newRewards[currentRewardIndex] = {
        ...newRewards[currentRewardIndex],
        file,
        preview: URL.createObjectURL(file)
      }
      setRewards(newRewards)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRewards = [...rewards]
    newRewards[currentRewardIndex] = {
      ...newRewards[currentRewardIndex],
      name: e.target.value
    }
    setRewards(newRewards)
  }

  const handleNextReward = async () => {
    const current = rewards[currentRewardIndex]
    if (!current.name || !current.file) {
      alert("Please provide a name and a picture for the reward.")
      return
    }

    if (currentRewardIndex < rewardCount - 1) {
      setCurrentRewardIndex(prev => prev + 1)
    } else {
      setStep('saving')
      try {
        const totalLessons = 6
        const finalRewards: RewardConfig[] = []
        
        if (isGuest) {
          for (let i = 0; i < rewards.length; i++) {
            const r = rewards[i]
            let base64 = r.preview
            
            try {
              base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(r.file!)
              })
            } catch (e) {
              console.error("Base64 conversion failed:", e)
            }

            const lessonsRequired = Math.round(((i + 1) / rewardCount) * totalLessons)
            finalRewards.push({
              id: `custom_reward_${i}`,
              name: r.name,
              imageUrl: base64,
              lessonsRequired
            })
          }

          localStorage.setItem('rewardsType', 'real')
          localStorage.setItem('customRewards', JSON.stringify(finalRewards))
          localStorage.setItem('guestOnboardingComplete', 'true')
          router.replace('/')
        } else {
          for (let i = 0; i < rewards.length; i++) {
            const r = rewards[i]
            const imageUrl = await uploadRewardImage(user!.uid, r.file!, i)
            const lessonsRequired = Math.round(((i + 1) / rewardCount) * totalLessons)
            
            finalRewards.push({
              id: `custom_reward_${i}`,
              name: r.name,
              imageUrl,
              lessonsRequired
            })
          }

          await saveUserRewardsConfig(user!.uid, 'real', finalRewards)
          router.replace('/')
        }
      } catch (error) {
        console.error("Error saving rewards:", error)
        alert("There was an error saving your rewards. Please try again.")
        setStep('upload-rewards')
      }
    }
  }

  // --- Render ---

  if (!ready) return null
  if (!user && !isGuest) return null

  if (step === 'saving') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
        <div className="text-6xl animate-bounce-custom mb-6">🚀</div>
        <h2 className="text-2xl font-bold text-gray-800 animate-pulse">{t.savingAdventure}</h2>
      </div>
    )
  }

  // Determine difficulty label
  const getDifficultyLabel = () => {
    if (currentRewardIndex === 0) return t.difficultyEasy
    if (currentRewardIndex === rewardCount - 1) return t.difficultyHard
    return t.difficultyMedium
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-lg overflow-hidden">
        
        {/* PROGRESS BAR */}
        {step !== 'welcome' && (
          <div className="bg-gray-100 h-2 w-full">
            <div 
              className="bg-duo-green h-full transition-all duration-500" 
              style={{ 
                width: step === 'reward-type' ? '25%' : 
                       step === 'reward-count' ? '50%' : 
                       step === 'upload-rewards' ? `${50 + ((currentRewardIndex + 1) / rewardCount * 50)}%` : '0%' 
              }} 
            />
          </div>
        )}

        <CardContent className="p-8">
          {/* BACK BUTTON (visible on all steps except welcome) */}
          {step !== 'welcome' && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-700 font-bold text-sm mb-4 transition-colors"
            >
              {t.back}
            </button>
          )}

          {/* STEP 1: WELCOME */}
          {step === 'welcome' && (
            <div className="text-center animate-slide-up">
              <div className="text-6xl mb-6">🦉</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{t.welcomeTitle}</h1>
              <p className="text-gray-600 mb-6 text-lg">
                {t.welcomeDesc}
              </p>
              <Button onClick={handleWelcomeNext} className="w-full duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg py-6 rounded-2xl">
                {t.welcomeStartBtn}
              </Button>
            </div>
          )}

          {/* STEP 2: REWARD TYPE */}
          {step === 'reward-type' && (
            <div className="animate-slide-in-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t.chooseRewardStyle}</h2>
              <div className="space-y-4">
                <Card 
                  className="border-2 border-gray-200 hover:border-duo-blue cursor-pointer transition-all hover:bg-blue-50"
                  onClick={() => handleSelectType('virtual')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="text-5xl">🌟</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{t.virtualRewardsTitle}</h3>
                      <p className="text-sm text-gray-500">{t.virtualRewardsDesc}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="border-2 border-gray-200 hover:border-duo-green cursor-pointer transition-all hover:bg-green-50"
                  onClick={() => handleSelectType('real')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="text-5xl">🎁</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{t.realRewardsTitle}</h3>
                      <p className="text-sm text-gray-500">{t.realRewardsDesc}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* STEP 3: REWARD COUNT */}
          {step === 'reward-count' && (
            <div className="animate-slide-in-right text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.howManyRealRewards}</h2>
              <p className="text-gray-500 mb-8">{t.howManyRealRewardsDesc}</p>
              
              <div className="flex justify-center gap-4 mb-8">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => handleSelectCount(num)}
                    className="w-20 h-20 rounded-2xl border-4 border-gray-200 hover:border-duo-blue text-3xl font-bold text-gray-700 hover:text-duo-blue transition-all bg-white shadow-sm hover:shadow-md"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: UPLOAD REWARDS */}
          {step === 'upload-rewards' && (
            <div className="animate-slide-in-right">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {t.configureReward.replace('{{current}}', String(currentRewardIndex + 1)).replace('{{total}}', String(rewardCount))}
                </h2>
                <span className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-sm">
                  {getDifficultyLabel()}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.whatIsPrize}</label>
                  <input
                    type="text"
                    value={rewards[currentRewardIndex]?.name || ''}
                    onChange={handleNameChange}
                    placeholder={t.prizePlaceholder}
                    className="w-full p-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-duo-blue focus:bg-white transition-colors outline-none text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.photoOfPrize}</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full h-48 rounded-xl border-4 border-dashed flex flex-col items-center justify-center transition-colors ${rewards[currentRewardIndex]?.preview ? 'border-duo-green bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                      {rewards[currentRewardIndex]?.preview ? (
                        <img 
                          src={rewards[currentRewardIndex].preview} 
                          alt="Preview" 
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <>
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-gray-500 font-medium">{t.tapToPhoto}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleNextReward} className="flex-1 duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg py-6 rounded-2xl">
                    {currentRewardIndex === rewardCount - 1 ? t.finishSave : t.nextReward}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
