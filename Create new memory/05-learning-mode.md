# Flujo 5: Learning Mode (Auto-Spelling tras Errores Repetidos)

## Skill Principal Utilizado
**`fullstack-dev`** — Diseño UX pedagógico + Web Speech API + React state management

## Descripción del Flujo
Sistema de apoyo automático que se activa cuando un niño falla 3 veces en la misma palabra durante un ejercicio. La app entra en "Learning Mode", deletreando la palabra repetidamente hasta que el niño la reconozca y pueda escribirla solo escuchándola.

---

## Origen del Requerimiento

**Usuario:** "When the progress is near the second reward my son or the user could have some problems writing the word when only can hear it because they do not know still exactly how the English words work so it must be a rule when the user miss 2-3 times a word it will spell it for him until he can recognize how the word is spelled and he can read it, write it only listening to it."

**Traducción:** Un niño de 7 años que aprende inglés como segundo idioma no tiene intuición sobre cómo funcionan las letras en inglés. Necesita escuchar el deletreo repetidamente hasta que la conexión sonido-letra se forme en su cerebro.

---

## Sistema de Ayuda Progresiva (3 Niveles)

```
Intento 1 (incorrecto):
  → Animación shake
  → Feedback rojo ("Not quite! Try again")
  → -1 heart

Intento 2 (incorrecto):
  → Todo lo anterior +
  → Show Hint visual: "S - P - O - O - N" (letras separadas por guiones)
  → spellAndSpeak() una vez (dice palabra → deletrea → dice palabra)

Intento 3+ (incorrecto):
  → Todo lo anterior +
  → LEARNING MODE:
    → Banner amarillo: "📚 Learning mode! Listen carefully to the spelling..."
    → Palabra mostrada en texto grande: "SPOON"
    → spellAndSpeak() se repite CADA 6 SEGUNDOS
    → Respuesta correcta resaltada con borde verde pulsante
    → Continúa hasta que el niño acierte
```

---

## Implementación Técnica

### Estado Agregado a Cada Ejercicio

```typescript
const [wrongAttempts, setWrongAttempts] = useState(0)     // Errores en la palabra actual
const [showHint, setShowHint] = useState(false)           // Mostrar hint visual
const [learningMode, setLearningMode] = useState(false)   // Modo aprendizaje activo
const spellingLoopRef = useRef<ReturnType<typeof setInterval> | null>(null) // Loop de spelling
```

### Activación del Learning Mode

```typescript
// Después de 3 errores en la misma palabra
if (newWrongAttempts >= 3 && !learningMode) {
  setLearningMode(true)

  // Deletrear inmediatamente
  setTimeout(() => {
    spellAndSpeak(targetWord)

    // Repetir cada 6 segundos
    if (spellingLoopRef.current) clearInterval(spellingLoopRef.current)
    spellingLoopRef.current = setInterval(() => {
      spellAndSpeak(targetWord)
    }, 6000)  // 6 segundos entre cada ciclo de spelling
  }, 1500)
}
```

### Limpieza del Loop (Critical!)

```typescript
// Al avanzar de ronda
const advanceRound = useCallback(() => {
  if (spellingLoopRef.current) {
    clearInterval(spellingLoopRef.current)
    spellingLoopRef.current = null
  }
  setWrongAttempts(0)
  setShowHint(false)
  setLearningMode(false)
  // ... reset resto del estado
}, [])

// Al desmontar el componente
useEffect(() => {
  return () => {
    if (spellingLoopRef.current) {
      clearInterval(spellingLoopRef.current)
      spellingLoopRef.current = null
    }
  }
}, [])

// Al quedarse sin hearts (game over)
if (newHearts <= 0) {
  if (spellingLoopRef.current) {
    clearInterval(spellingLoopRef.current)
    spellingLoopRef.current = null
  }
  setTimeout(() => onGameOver(xpEarned), 800)
}
```

---

## UX del Learning Mode

### Listen & Choose (Ejercicio de Escucha)

```
┌────────────────────────────────────┐
│          🔊 (botón grande)         │
│     "Tap to hear the word!"       │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📚 Learning mode!           │  │
│  │ Listen carefully...          │  │
│  │        S P O O N            │  │  ← Palabra en texto grande
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │    SPOON    ← borde verde   │  │  ← Respuesta correcta pulsante
│  │         pulsante             │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │         FORK                 │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │         KNIFE                │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │         PLATE                │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Spelling Challenge (Ejercicio de Deletreo)

```
┌────────────────────────────────────┐
│         [imagen de SPOON]          │
│       🔊 Hear the word            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📚 Learning mode!           │  │
│  │ Listen and spell along...    │  │
│  │        SPOON                 │  │  ← Palabra visible
│  └──────────────────────────────┘  │
│                                    │
│    [S] [P] [O] [O] [N]  ← slots  │
│                                    │
│    [O] [N] [S] [P] [O]  ← tiles  │
└────────────────────────────────────┘
```

---

## Ejercicios que Tienen Learning Mode

| Ejercicio | Learning Mode | Detalle |
|-----------|:------------:|---------|
| Flashcards | No | No hay posibilidad de error |
| Picture Match | No | Solo muestra imágenes, no spelling |
| Listen & Choose | **SÍ** | Deletreo repetido + respuesta resaltada |
| Spelling Challenge | **SÍ** | Deletreo repetido + palabra visible |
| What's Missing | **SÍ** | Deletreo repetido + letra correcta resaltada |
| Final Test | No | Es evaluación, no práctica (se mueve a siguiente pregunta) |

---

## Lecciones Aprendidas

### 1. El Timing del Loop es Crucial
**Decisión:** 6 segundos entre cada ciclo de spelling.
**Por qué:** Un ciclo de `spellAndSpeak()` para una palabra de 5 letras toma ~5-6 segundos (1200ms palabra + 5×800ms letras + 500ms + 1200ms palabra). Si el intervalo es menor, los audios se superponen.

### 2. SIEMPRE Limpiar el Interval
**Problema potencial:** Si el componente se desmonta sin limpiar el `setInterval`, el spelling sigue ejecutándose en segundo plano, causando bugs de audio y memory leaks.

**Solución:** 3 puntos de limpieza:
1. `advanceRound()` — Al cambiar de ronda
2. `useEffect` cleanup — Al desmontar componente
3. Game over handler — Al perder todas las vidas

### 3. No Activar Learning Mode en Evaluaciones
**Decisión:** El Final Test NO tiene Learning Mode. Si falla, avanza a la siguiente pregunta.
**Por qué:** El Final Test es evaluación, no práctica. El Learning Mode es para los ejercicios de práctica donde el niño debe aprender la palabra.

### 4. La Respuesta Correcta Debe Ser Obvia en Learning Mode
**Principio pedagógico:** Cuando un niño falla 3 veces, no es un momento de "test", es un momento de "teaching". Mostrar la respuesta correcta con un borde verde pulsante NO es hacer trampa — es enseñar. El niño aprende por repetición: ver la palabra + escucharla + seleccionarla forma la conexión neural.

### 5. El Hint Visual es Diferente del Learning Mode
**Distinción:**
- **Hint** (2 errores): Solo muestra las letras separadas `S - P - O - O - N`. El niño debe descubrir la respuesta.
- **Learning Mode** (3 errores): Muestra la palabra completa `SPOON`, deletrea en audio repetidamente, y resalta la respuesta. Es enseñanza directa.
