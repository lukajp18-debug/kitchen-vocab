'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  ColumnProblem,
  BreakApartProblem,
  WordProblem,
  CoinType,
  COIN_VALUE,
  CountCoinsRound,
  ClockTime,
} from '@/types/math'

// ============ SHARED HELPERS ============
const ENCOURAGEMENTS = ['¡Excelente! 🌟', '¡Muy bien! 🎉', '¡Genial! ✨', '¡Súper! 🚀', '¡Perfecto! 💯', '¡Increíble! 🎊']
const randomEncouragement = () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const fmtTime = (t: ClockTime) => `${t.hour}:${String(t.minute).padStart(2, '0')}`

// ============ SHARED CHROME ============
function MathHeader({ title, hearts, current, total, onBack }: {
  title: string; hearts: number; current: number; total: number; onBack: () => void
}) {
  const pct = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-sm pb-3">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-12 w-12 rounded-full text-xl" aria-label="Close">✕</Button>
        <div className="flex-1 duo-progress">
          <Progress value={pct} className="h-4 rounded-full" />
        </div>
        <div className="flex gap-0.5 text-lg shrink-0">
          {[0, 1, 2].map((i) => <span key={i}>{i < hearts ? '❤️' : '🤍'}</span>)}
        </div>
      </div>
      <h2 className="text-center font-bold text-gray-700 text-sm">{title}</h2>
    </div>
  )
}

// Numeric answer box + check button, shared by the number-answer lessons.
function AnswerInput({ value, onChange, onSubmit, disabled }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; disabled: boolean
}) {
  return (
    <div className="flex items-center gap-2 justify-center mt-6">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="?"
        autoFocus
        className="w-40 text-center text-3xl font-black text-gray-900 placeholder:text-gray-300 py-3 rounded-2xl border-2 border-gray-200 focus:border-duo-blue focus:outline-none transition-colors"
      />
      <Button onClick={onSubmit} disabled={disabled || value === ''} className="duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg px-6 py-6 rounded-2xl">
        ✓
      </Button>
    </div>
  )
}

function Feedback({ feedback }: { feedback: 'correct' | 'wrong' | null }) {
  if (!feedback) return null
  return (
    <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
      {feedback === 'correct' ? randomEncouragement() : '¡Inténtalo otra vez! 💪'}
    </div>
  )
}

// ============ PLACE VALUE GRID ============
function digits3(n: number): [string, string, string] {
  const s = String(n).padStart(3, '0')
  return [s[0], s[1], s[2]]
}

function PlaceValueGrid({ a, b, op, reveal }: { a: number; b: number; op: 'add' | 'sub'; reveal?: number | null }) {
  const [ah, at, ao] = digits3(a)
  const [bh, bt, bo] = digits3(b)
  const sign = op === 'add' ? '+' : '−'
  const Cell = ({ d }: { d: string }) => (
    <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-gray-300 flex items-center justify-center text-3xl font-black text-gray-800">{d}</div>
  )
  const head = (label: string) => (
    <div className="w-14 sm:w-16 text-center text-xs font-bold text-gray-500 border-2 border-b-0 border-gray-200 py-0.5">{label}</div>
  )
  const rev = reveal != null ? String(reveal).padStart(4, ' ') : null
  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex">
        <div className="w-8" />{head('Hundreds')}{head('Tens')}{head('Ones')}
      </div>
      <div className="flex items-center">
        <div className="w-8" /><Cell d={ah} /><Cell d={at} /><Cell d={ao} />
      </div>
      <div className="flex items-center border-b-4 border-gray-700">
        <div className="w-8 text-3xl font-black text-gray-700 text-center">{sign}</div><Cell d={bh} /><Cell d={bt} /><Cell d={bo} />
      </div>
      {rev != null && (
        <div className="flex items-center mt-1">
          <div className="w-8" />
          {rev.slice(-3).split('').map((d, i) => (
            <div key={i} className="w-14 sm:w-16 text-center text-3xl font-black text-duo-green">{d.trim()}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ CLOCK FACE ============
export function ClockFace({ hour, minute, size = 200 }: { hour: number; minute: number; size?: number }) {
  const c = size / 2
  const minAngle = minute * 6
  const hrAngle = (hour % 12) * 30 + minute * 0.5
  const hand = (angleDeg: number, len: number) => {
    const rad = (angleDeg - 90) * (Math.PI / 180)
    return { x: c + len * Math.cos(rad), y: c + len * Math.sin(rad) }
  }
  const m = hand(minAngle, size * 0.38)
  const h = hand(hrAngle, size * 0.26)
  const nums = Array.from({ length: 12 }, (_, i) => i + 1)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={c - 4} fill="#fff" stroke="#374151" strokeWidth="4" />
      {nums.map((n) => {
        const rad = (n * 30 - 90) * (Math.PI / 180)
        const x = c + (c - 22) * Math.cos(rad)
        const y = c + (c - 22) * Math.sin(rad)
        return <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.09} fontWeight="bold" fill="#374151">{n}</text>
      })}
      <line x1={c} y1={c} x2={h.x} y2={h.y} stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
      <line x1={c} y1={c} x2={m.x} y2={m.y} stroke="#1CB0F6" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={c} cy={c} r="6" fill="#1f2937" />
    </svg>
  )
}

// ============ COIN ============
const COIN_STYLE: Record<CoinType, { label: string; nameEs: string; fill: string; stroke: string; r: number }> = {
  penny: { label: '1¢', nameEs: 'Penny', fill: '#cd7f32', stroke: '#a05a1f', r: 26 },
  nickel: { label: '5¢', nameEs: 'Nickel', fill: '#b8b8b8', stroke: '#8a8a8a', r: 32 },
  dime: { label: '10¢', nameEs: 'Dime', fill: '#c0c0c0', stroke: '#909090', r: 22 },
  quarter: { label: '25¢', nameEs: 'Quarter', fill: '#cfcfcf', stroke: '#9a9a9a', r: 36 },
}

function Coin({ type, showValue = true }: { type: CoinType; showValue?: boolean }) {
  const s = COIN_STYLE[type]
  const d = s.r * 2 + 6
  return (
    <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`}>
      <circle cx={d / 2} cy={d / 2} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth="3" />
      <circle cx={d / 2} cy={d / 2} r={s.r - 5} fill="none" stroke={s.stroke} strokeWidth="1.5" opacity="0.6" />
      {showValue && <text x={d / 2} y={d / 2} textAnchor="middle" dominantBaseline="central" fontSize={s.r * 0.7} fontWeight="bold" fill="#5a4632">{s.label}</text>}
    </svg>
  )
}

// ============ COLUMN SOLVE (Addition / Subtraction) ============
type ColRound = { a: number; b: number; op: 'add' | 'sub'; breakApart?: boolean }

export function ColumnSolveView({ title, columns, breakApart, op, xp, onComplete, onGameOver, onBack }: {
  title: string
  columns: ColumnProblem[]
  breakApart?: BreakApartProblem[]
  op: 'add' | 'sub'
  xp: number
  onComplete: (xp: number) => void
  onGameOver: (xp: number) => void
  onBack: () => void
}) {
  const rounds: ColRound[] = useMemo(() => {
    const base: ColRound[] = columns.map((c) => ({ a: c.a, b: c.b, op: c.op }))
    const ba: ColRound[] = (breakApart ?? []).map((p) => ({ a: p.a, b: p.b, op: 'add', breakApart: true }))
    return [...base, ...ba]
  }, [columns, breakApart])

  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const r = rounds[round]
  const answer = op === 'add' || r.op === 'add' ? r.a + r.b : r.a - r.b
  const total = rounds.length

  const submit = useCallback(() => {
    if (feedback) return
    if (parseInt(value, 10) === answer) {
      setFeedback('correct')
      const nc = correct + 1
      setCorrect(nc)
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else {
          setRound((p) => p + 1); setValue(''); setFeedback(null)
          setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400)
        }
      }, 1100)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setValue('') }, 1000)
    }
  }, [feedback, value, answer, correct, round, total, hearts, xp, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><MathHeader title={title} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <p className="text-gray-500 font-semibold mb-2">{r.breakApart ? 'Suma usando "break apart" 🧩' : 'Resuelve la operación'}</p>
        <div className={anim}><PlaceValueGrid a={r.a} b={r.b} op={op} reveal={feedback === 'correct' ? answer : null} /></div>
        {r.breakApart && feedback !== 'correct' && (
          <p className="mt-3 text-sm text-gray-500 text-center max-w-xs">
            Pista: {r.a} = {Math.floor(r.a / 100) * 100} + {Math.floor((r.a % 100) / 10) * 10} + {r.a % 10}
            {'  •  '}{r.b} = {Math.floor(r.b / 100) * 100} + {Math.floor((r.b % 100) / 10) * 10} + {r.b % 10}
          </p>
        )}
        <AnswerInput value={value} onChange={setValue} onSubmit={submit} disabled={feedback === 'correct'} />
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

// ============ WORD PROBLEMS ============
export function WordProblemsView({ problems, xp, onComplete, onGameOver, onBack }: {
  problems: WordProblem[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const p = problems[round]
  const answer = p.op === 'add' ? p.a + p.b : p.a - p.b
  const total = problems.length

  const submit = useCallback(() => {
    if (feedback) return
    if (parseInt(value, 10) === answer) {
      setFeedback('correct')
      const nc = correct + 1; setCorrect(nc)
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound((x) => x + 1); setValue(''); setFeedback(null); setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400) }
      }, 1300)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setValue('') }, 1000)
    }
  }, [feedback, value, answer, correct, round, total, hearts, xp, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><MathHeader title="Word Problems" hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <Card className={`border-0 shadow-md w-full max-w-md ${anim}`}>
          <CardContent className="p-5 flex flex-col items-center text-center">
            <img src={p.image} alt="" className="w-40 h-40 object-contain mb-3" />
            <p className="text-gray-800 font-semibold leading-snug">{p.sentenceEs}</p>
            <p className="text-gray-400 text-sm mt-1 italic">{p.sentenceEn}</p>
          </CardContent>
        </Card>
        <AnswerInput value={value} onChange={setValue} onSubmit={submit} disabled={feedback === 'correct'} />
        {feedback === 'correct' && <p className="mt-2 font-bold text-duo-green">{p.isMoney ? `$${answer}` : answer} {p.answerSuffix}</p>}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

// ============ MONEY ============
type MoneyRound =
  | { kind: 'name'; coin: CoinType; options: CoinType[] }
  | { kind: 'count'; coins: CoinType[] }

export function MoneyView({ rounds, xp, onComplete, onGameOver, onBack }: {
  rounds: CountCoinsRound[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const allCoins: CoinType[] = ['penny', 'nickel', 'dime', 'quarter']
  const sequence: MoneyRound[] = useMemo(() => {
    const naming: MoneyRound[] = shuffle(allCoins).map((coin) => ({ kind: 'name', coin, options: shuffle(allCoins) }))
    const counting: MoneyRound[] = rounds.map((r) => ({ kind: 'count', coins: r.coins }))
    return [...naming, ...counting]
  }, [rounds])

  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState<CoinType | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const cur = sequence[round]
  const total = sequence.length
  const countTotal = cur.kind === 'count' ? cur.coins.reduce((s, c) => s + COIN_VALUE[c], 0) : 0

  const next = useCallback((isRight: boolean) => {
    if (isRight) {
      setFeedback('correct')
      const nc = correct + 1; setCorrect(nc)
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound((x) => x + 1); setValue(''); setSelected(null); setFeedback(null); setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400) }
      }, 1100)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setValue(''); setSelected(null) }, 1000)
    }
  }, [correct, round, total, hearts, xp, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><MathHeader title="Money & Coins" hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        {cur.kind === 'name' ? (
          <>
            <p className="text-gray-500 font-semibold mb-3">¿Qué moneda es esta?</p>
            <div className={anim}><Coin type={cur.coin} /></div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
              {cur.options.map((opt) => {
                const isSel = selected === opt
                const isRight = opt === cur.coin
                let cls = 'border-2 cursor-pointer transition-all py-3 rounded-2xl font-bold text-gray-700 bg-surface'
                if (feedback && isRight) cls += ' ring-4 ring-duo-green bg-green-50'
                else if (feedback === 'wrong' && isSel) cls += ' ring-4 ring-duo-red bg-red-50'
                return (
                  <button key={opt} disabled={!!feedback} onClick={() => { setSelected(opt); next(isRight) }} className={cls}>
                    {COIN_STYLE[opt].nameEs} ({COIN_STYLE[opt].label})
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 font-semibold mb-3">Cuenta las monedas. Escribe el total en centavos (¢).</p>
            <div className={`flex flex-wrap gap-2 justify-center max-w-sm ${anim}`}>
              {cur.coins.map((c, i) => <Coin key={i} type={c} />)}
            </div>
            <AnswerInput value={value} onChange={setValue} onSubmit={() => { if (!feedback) next(parseInt(value, 10) === countTotal) }} disabled={feedback === 'correct'} />
            {feedback === 'correct' && <p className="mt-2 font-bold text-duo-green">{countTotal}¢</p>}
          </>
        )}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

// ============ TELLING THE TIME ============
type TimeRound = { kind: 'read'; time: ClockTime; options: string[] } | { kind: 'set'; time: ClockTime }

export function TimeView({ times, xp, onComplete, onGameOver, onBack }: {
  times: ClockTime[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const sequence: TimeRound[] = useMemo(() => {
    const labels = times.map(fmtTime)
    return times.map((t, i) => {
      if (i % 2 === 0) {
        const distractors = shuffle(labels.filter((l) => l !== fmtTime(t))).slice(0, 3)
        return { kind: 'read', time: t, options: shuffle([fmtTime(t), ...distractors]) }
      }
      return { kind: 'set', time: t }
    })
  }, [times])

  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')
  // for 'set' rounds
  const [setHour, setSetHour] = useState(12)
  const [setMin, setSetMin] = useState(0)

  const cur = sequence[round]
  const total = sequence.length

  const advance = useCallback((isRight: boolean) => {
    if (isRight) {
      setFeedback('correct')
      const nc = correct + 1; setCorrect(nc)
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound((x) => x + 1); setSelected(null); setFeedback(null); setSetHour(12); setSetMin(0); setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400) }
      }, 1100)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setSelected(null) }, 1000)
    }
  }, [correct, round, total, hearts, xp, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><MathHeader title="Telling the Time" hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        {cur.kind === 'read' ? (
          <>
            <p className="text-gray-500 font-semibold mb-3">¿Qué hora marca el reloj?</p>
            <div className={anim}><ClockFace hour={cur.time.hour} minute={cur.time.minute} /></div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
              {cur.options.map((opt) => {
                const isSel = selected === opt
                const isRight = opt === fmtTime(cur.time)
                let cls = 'border-2 cursor-pointer transition-all py-3 rounded-2xl font-black text-xl text-gray-700 bg-surface'
                if (feedback && isRight) cls += ' ring-4 ring-duo-green bg-green-50'
                else if (feedback === 'wrong' && isSel) cls += ' ring-4 ring-duo-red bg-red-50'
                return <button key={opt} disabled={!!feedback} onClick={() => { setSelected(opt); advance(isRight) }} className={cls}>{opt}</button>
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 font-semibold mb-1">Pon las manecillas en:</p>
            <p className="text-3xl font-black text-duo-pink mb-3">{fmtTime(cur.time)}</p>
            <div className={anim}><ClockFace hour={setHour} minute={setMin} /></div>
            <div className="flex gap-6 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 mb-1">Hora</span>
                <div className="flex items-center gap-2">
                  <button disabled={!!feedback} onClick={() => setSetHour((h) => (h === 1 ? 12 : h - 1))} className="w-10 h-10 rounded-full bg-gray-200 font-black text-xl">−</button>
                  <span className="w-8 text-center text-2xl font-black">{setHour}</span>
                  <button disabled={!!feedback} onClick={() => setSetHour((h) => (h === 12 ? 1 : h + 1))} className="w-10 h-10 rounded-full bg-gray-200 font-black text-xl">+</button>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 mb-1">Minutos</span>
                <div className="flex items-center gap-2">
                  <button disabled={!!feedback} onClick={() => setSetMin((m) => (m === 0 ? 45 : m - 15))} className="w-10 h-10 rounded-full bg-gray-200 font-black text-xl">−</button>
                  <span className="w-10 text-center text-2xl font-black">{String(setMin).padStart(2, '0')}</span>
                  <button disabled={!!feedback} onClick={() => setSetMin((m) => (m === 45 ? 0 : m + 15))} className="w-10 h-10 rounded-full bg-gray-200 font-black text-xl">+</button>
                </div>
              </div>
            </div>
            <Button onClick={() => { if (!feedback) advance(setHour === cur.time.hour && setMin === cur.time.minute) }} disabled={feedback === 'correct'} className="duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg px-10 py-6 rounded-2xl mt-5">
              Comprobar ✓
            </Button>
          </>
        )}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}
