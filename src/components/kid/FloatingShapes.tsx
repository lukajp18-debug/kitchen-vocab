// Soft shapes drifting slowly behind the home and dashboard screens.
// Render inside a container with `relative isolate`; it sits at -z-10.
const SHAPES = [
  { cls: 'bg-brand', size: 220, top: '-60px', left: '-80px', delay: '0s', dur: '18s' },
  { cls: 'bg-sun', size: 140, top: '30%', left: '78%', delay: '-4s', dur: '22s' },
  { cls: 'bg-go', size: 180, top: '62%', left: '-60px', delay: '-9s', dur: '20s' },
  { cls: 'bg-sky', size: 120, top: '85%', left: '70%', delay: '-2s', dur: '16s' },
]

export function FloatingShapes() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full opacity-[0.10] dark:opacity-[0.16] animate-drift ${s.cls}`}
          style={{ width: s.size, height: s.size, top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.dur }}
        />
      ))}
    </div>
  )
}
