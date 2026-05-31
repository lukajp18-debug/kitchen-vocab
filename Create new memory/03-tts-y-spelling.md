# Flujo 3: TTS (Texto a Voz) y Sistema de Spelling

## Skill Principal Utilizado
**`fullstack-dev`** — Web Speech API del navegador, sin APIs externas ni costo

## Descripción del Flujo
Sistema de texto-a-voz que permite al niño escuchar las palabras y su deletreo. Incluye pronunciación de palabras completas y deletreo letra por letra con manejo especial de letras dobles.

---

## Función 1: `speakWord()` — Pronunciar palabra completa

```typescript
function speakWord(word: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()           // Cancelar cualquier audio en curso
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  utterance.rate = 0.8                       // 20% más lento para niños
  utterance.pitch = 1.1                      // Tono ligeramente agudo (amigable)
  window.speechSynthesis.speak(utterance)
}
```

### Parámetros Clave
- **rate: 0.8** — Velocidad reducida. A 1.0 es demasiado rápido para un niño de 7 años.
- **pitch: 1.1** — Tono ligeramente más alto. Suena más "amigable" para niños.
- **lang: 'en-US'** — Inglés americano. Importante para consistencia fonética.
- **cancel()** antes de hablar — Evita que se superpongan audios.

### Dónde se usa
- Al tocar el botón "🔊 Hear the word"
- Al acertar una respuesta (refuerzo positivo: oyes la palabra que acertaste)
- Al iniciar cada ronda de spelling

---

## Función 2: `spellAndSpeak()` — Deletrear palabra con audio

```typescript
function spellAndSpeak(word: string, onComplete?: () => void): ReturnType<typeof setTimeout> | null
```

### Secuencia de Audio

```
Paso 1: Decir la palabra completa     → "glass"      (delay: 0ms,     duración: ~1200ms)
Paso 2: Deletrear cada letra          → "g, l, a, double s" (800ms entre cada)
Paso 3: Decir la palabra completa     → "glass"      (delay: después del spelling)
```

### Manejo de Letras Dobles

```typescript
// Algoritmo: agrupar letras consecutivas iguales
const spellParts: string[] = []
let i = 0
while (i < word.length) {
  let count = 1
  while (i + count < word.length && word[i + count].toLowerCase() === word[i].toLowerCase()) {
    count++
  }
  if (count >= 2) {
    spellParts.push(`double ${word[i].toLowerCase()}`)  // "double s"
  } else {
    spellParts.push(word[i].toLowerCase())               // "g", "l", "a"
  }
  i += count
}
```

### Ejemplos de Spelling

| Palabra | Spelling Producido |
|---------|-------------------|
| GLASS | g, l, a, double s |
| SPOON | s, p, double o, n |
| BLENDER | b, l, e, n, d, e, r |
| CUP | c, u, p |
| KNIFE | k, n, i, f, e |

### Parámetros del Spelling
- **rate: 0.7** — Aún más lento que `speakWord()` para que cada letra se distinga.
- **pitch: 1.2** — Tono más alto para diferenciar del habla normal.
- **800ms entre letras** — Tiempo suficiente para procesar cada letra.
- **1200ms después de la palabra** — Pausa antes de empezar a deletrear.
- **500ms entre spelling y palabra final** — Breve pausa de transición.

### Callback `onComplete`
```typescript
return onComplete ? setTimeout(onComplete, delay) : null
```
Permite saber cuándo terminó el audio completo. Se usa para:
- Desbloquear el botón 🔊 mientras se está deletreando
- Iniciar el Learning Mode después de completar un ciclo de spelling

---

## Errores Corregidos (Iteraciones con el Usuario)

### Error 1: "Capital A, Capital B"
**Problema:** El TTS decía "capital A, capital B" en vez de solo "A, B".

**Causa:** Se usaba `letter.toUpperCase()` para generar el utterance. El motor TTS interpreta letras mayúsculas como "capital [letra]".

**Solución:** Usar SIEMPRE letras minúsculas en el utterance:
```typescript
// ANTES (incorrecto):
spellParts.push(word[i].toUpperCase())  // "A" → TTS dice "Capital A"

// DESPUÉS (correcto):
spellParts.push(word[i].toLowerCase())  // "a" → TTS dice "a"
```

### Error 2: Orden del Spelling
**Problema inicial:** Solo se deletreaban las letras, sin decir la palabra completa antes ni después.

**Solución del usuario:** "Primero debe decir la palabra, luego deletrearla, y terminar diciendo la palabra completa."

**Implementación:** Secuencia de 3 pasos con delays acumulativos:
```
Palabra completa → Pausa → Letra por letra → Pausa → Palabra completa
```

### Error 3: Letras Dobles ("S, S")
**Problema:** GLASS se deletreaba "G, L, A, S, S" lo cual es confuso para un niño que no sabe por qué hay dos S.

**Solución:** Agrupar letras consecutivas iguales y decir "double [letra]":
```
GLASS → "g, l, a, double s"
SPOON → "s, p, double o, n"
```

**Lección:** Los niños de 7 años necesitan que se les explicite por qué una letra se repite. "Double S" le da significado a la repetición.

---

## Lecciones Aprendidas

### 1. Web Speech API es Suficiente
No se necesita una API de TTS pagada (Google, Amazon, etc.). La Web Speech API:
- Es gratis
- Funciona offline
- Tiene buena calidad en iOS y Android
- Permite controlar rate y pitch

**Limitación:** En algunos Android, el motor TTS puede variar. Pero para vocabulario simple funciona perfecto.

### 2. Siempre `cancel()` Antes de Hablar
Si no se cancela el audio anterior, se acumulan y se escucha todo superpuesto. Este fue un bug sutil que aparecía al tocar el botón 🔊 rápidamente.

### 3. El Spelling es el Core del Aprendizaje
La función `spellAndSpeak()` es la pieza más importante de toda la app. Se usa en:
- Listen & Choose (auto-play cada ronda)
- Hint después de 2 errores
- Learning Mode (repetición cada 6 segundos)
- Botón 🔊 manual

Sin esta función, el niño no puede aprender a deletrear.
