import { Dino } from './Dino'

const block = 'bg-slate-200/80 rounded-2xl animate-pulse'

// Placeholder shaped like the topic list, shown while the app loads.
export function TopicsSkeleton() {
  return (
    <div className="min-h-screen bg-app flex flex-col" aria-busy="true">
      <div className="bg-surface shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dino size={44} mood="thinking" />
            <div className="space-y-1.5">
              <div className={`${block} h-4 w-24`} />
              <div className={`${block} h-3 w-16`} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`${block} h-11 w-14 rounded-full`} />
            <div className={`${block} h-11 w-16 rounded-full`} />
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className={`${block} h-24 w-24 rounded-full`} />
            <div className={`${block} h-6 w-64`} />
            <div className={`${block} h-4 w-48`} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className={`${block} h-28 rounded-3xl`} />
            <div className={`${block} h-28 rounded-3xl`} />
          </div>
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-surface rounded-[28px] border-2 border-line p-5 flex items-center gap-4">
                <div className={`${block} h-16 w-16 shrink-0`} />
                <div className="flex-1 space-y-2">
                  <div className={`${block} h-5 w-3/4`} />
                  <div className={`${block} h-3 w-1/2`} />
                  <div className={`${block} h-2 w-full rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
