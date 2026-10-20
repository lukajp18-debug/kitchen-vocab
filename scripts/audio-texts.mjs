// Prints (as JSON) every text the lessons say out loud, read straight from src/data.
// Used by build-audio.py to know which recordings must exist.
//   node scripts/audio-texts.mjs
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const nodeRequire = createRequire(import.meta.url)
const ts = nodeRequire(resolve(root, 'node_modules/typescript'))

const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file).exports
  const src = readFileSync(file, 'utf8')
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const mod = { exports: {} }
  cache.set(file, mod)
  const req = (p) => (p.startsWith('.') ? load(resolve(dirname(file), p.endsWith('.ts') ? p : p + '.ts')) : nodeRequire(p))
  new Function('require', 'module', 'exports', js)(req, mod, mod.exports)
  return mod.exports
}

const { TOPICS } = load(resolve(root, 'src/data/topics.ts'))

const words = new Set()
const phrases = new Set()
const word = (w) => { if (w && /^[A-Za-z]+$/.test(w.trim())) words.add(w.trim().toLowerCase()) }
const phrase = (p) => { if (p) phrases.add(p.trim()) }

for (const t of TOPICS) {
  for (const w of t.words ?? []) word(w.word)
  const c = t.workshopContent
  if (!c) continue
  for (const d of c.dictation) word(d.speak ?? d.answer)
  for (const d of c.imageWords) word(d.answer)
  for (const d of c.whWords) word(d.word)
  for (const d of c.completeSentences) {
    word(d.answer)
    ;(d.alsoAccept ?? []).forEach(word)
    phrase(d.sentence.replace('___', 'blank'))
    phrase(d.sentence.replace('___', d.answer))
  }
  c.wordBank.forEach(word)
  for (const i of c.sort.items) word(i.word)
  for (const k of c.sort.circles) { phrase(k.prompt); k.options.forEach(word); word(k.answer) }
  for (const q of c.longAnswers) phrase(q.question)
}

console.log(JSON.stringify({ words: [...words].sort(), phrases: [...phrases].sort() }, null, 2))
