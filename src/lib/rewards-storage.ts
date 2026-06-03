import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { storage, db } from './firebase'

export interface RewardConfig {
  id: string
  name: string
  imageUrl: string
  lessonsRequired: number
}

/**
 * Uploads a reward image to Firebase Storage and returns the download URL.
 */
export async function uploadRewardImage(uid: string, file: File, index: number): Promise<string> {
  // Create a reference to 'users/{uid}/rewards/reward_{index}_{timestamp}'
  const extension = file.name.split('.').pop() || 'png'
  const path = `users/${uid}/rewards/reward_${index}_${Date.now()}.${extension}`
  const storageRef = ref(storage, path)

  // Upload the file
  await uploadBytes(storageRef, file)

  // Get the download URL
  const downloadUrl = await getDownloadURL(storageRef)
  return downloadUrl
}

export async function markOnboardingComplete(uid: string) {
  const res = await fetch('/api/user-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, onboardingComplete: true }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to mark onboarding complete')
  }
}

/**
 * Saves the user's reward configuration for a specific topic.
 */
export async function saveUserRewardsConfig(uid: string, rewardsType: 'virtual' | 'real', rewards?: RewardConfig[]) {
  const userRef = doc(db, 'users', uid)

  await updateDoc(userRef, {
    rewardsType,
    customRewards: rewards || [],
    onboardingComplete: true
  })
}
