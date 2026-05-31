# Flujo 2: Sistema de Ejercicios Duolingo-Style

## Skill Principal Utilizado
**`fullstack-dev`** — Diseño e implementación de 6 tipos de ejercicios interactivos gamificados

## Descripción del Flujo
Sistema de 6 ejercicios progresivos que enseñan vocabulario de cocina, desde reconocimiento visual hasta deletreo completo, siguiendo la filosofía Duolingo: progresión gradual, hearts (vidas), XP, feedback inmediato.

---

## Los 6 Ejercicios (en orden de dificultad)

### 1. Flashcards (`FlashcardView`)
| Aspecto | Detalle |
|---------|---------|
| Objetivo | Aprender las 10 palabras con imagen |
| Mecánica | Deslizar tarjetas (imagen + palabra + audio) |
| Rounds | 10 (una por palabra) |
| Hearts | Sin límite |
| XP | +10 total |
| Interacción | Tap para escuchar, botón Next |

**Patrón clave:** No hay posibilidad de error. Es pura exposición al vocabulario.

### 2. Picture Match (`PictureMatchView`)
| Aspecto | Detalle |
|---------|---------|
| Objetivo | Asociar palabra con imagen |
| Mecánica | Ver una palabra, elegir entre 4 imágenes |
| Rounds | 8 |
| Hearts | 3 |
| XP | +10 por acierto |
| Interacción | Tap en imagen |

**Patrón clave:** 4 opciones con distractores aleatorios. `getRandomItems()` excluye la palabra correcta.

### 3. Listen & Choose (`ListenChooseView`)
| Aspecto | Detalle |
|---------|---------|
| Objetivo | Reconocer la palabra al escucharla deletreada |
| Mecánica | Escuchar spelling, elegir entre 4 opciones de texto |
| Rounds | 8 |
| Hearts | 3 |
| XP | +10 por acierto |
| Interacción | Botón 🔊 para escuchar, tap en palabra |

**Patrón clave:** Auto-deletrea al iniciar cada ronda. Tiene "Learning Mode" después de 3 errores (ver Flujo 5).

### 4. Spelling Challenge (`SpellingChallengeView`)
| Aspecto | Detalle |
|---------|---------|
| Objetivo | Deletrear la palabra viendo la imagen |
| Mecánica | Ver imagen + escuchar palabra, armar con letras desordenadas |
| Rounds | 8 |
| Hearts | 3 |
| XP | +10 por acierto |
| Interacción | Tap en letra → se agrega al slot. Tap en slot → se quita. |

**Patrón clave:** Letras scrambled con slots vacíos. La lógica de `usedIndices` rastrea qué letras ya se usaron para evitar duplicados.

### 5. What's Missing (`WhatsMissingView`)
| Aspecto | Detalle |
|---------|---------|
| Objetivo | Identificar la letra que falta |
| Mecánica | Ver palabra con un guión bajo (ej: "G_ASS"), elegir letra correcta |
| Rounds | 8 |
| Hearts | 3 |
| XP | +10 por acierto |
| Interacción | Tap en letra de 4 opciones |

**Patrón clave:** El índice faltante nunca es el primer carácter (`slice(1)`) para que el niño tenga contexto de la palabra.

### 6. Final Test (`FinalTestView`)
| Aspecto | Detalle |
|---------|---------|
| Objetivo | Evaluación mixta de todas las habilidades |
| Mecánica | Mezcla aleatoria de 3 picture-match + 3 listen + 3 spelling + 3 fill-blank |
| Rounds | 12 |
| Hearts | 3 |
| XP | +10 por acierto, +120 total si perfecto |
| Interacción | Cambia según el tipo de pregunta |

**Patrón clave:** Las preguntas se generan una vez con `useState(() => createFinalTestQuestions())` y no cambian. El componente renderiza el sub-componente adecuado según `currentQuestion.type`.

---

## Patrón Común de Ejercicio

Todos los ejercicios siguen este patrón:

```typescript
function ExerciseView({ onComplete, onGameOver, onBack }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [learningMode, setLearningMode] = useState(false)
  const totalRounds = 8

  const advanceRound = useCallback(() => {
    // Reset todo el estado + generar nueva ronda
  }, [])

  // Respuesta correcta:
  //   setFeedback('correct') → +10 XP → advanceRound o onComplete

  // Respuesta incorrecta:
  //   setFeedback('wrong') → -1 heart → hint en 2do error → learning mode en 3er error
  //   Si hearts=0 → onGameOver
}
```

---

## Sistema de Ayuda Progresiva (3 niveles)

```
Intento 1 (incorrecto):  Animación shake, feedback rojo
Intento 2 (incorrecto):  + Muestra hint visual (letras separadas por guiones)
                          + Deletrea la palabra una vez por audio
Intento 3+ (incorrecto): + LEARNING MODE: deletreo continuo cada 6 segundos
                          + Muestra la palabra en banner amarillo
                          + Resalta la respuesta correcta con borde verde pulsante
```

---

## Lecciones Aprendidas

### 1. El Bug del "Pre-selected Answer"
**Problema:** En el Final Test, al avanzar a la siguiente pregunta, la respuesta correcta ya estaba seleccionada y resaltada en verde. El niño no podía interactuar.

**Causa raíz:** Los sub-componentes (`FinalPictureMatch`, `FinalListenChoose`, etc.) no reseteaban `selected` y `feedback` cuando cambiaba la pregunta.

**Solución:** Agregar `useEffect` de reset en cada sub-componente:
```typescript
useEffect(() => {
  setSelected(null)
  setFeedback(null)
}, [targetWord.word])  // Se ejecuta cada vez que cambia la palabra
```

**Lección:** Siempre resetear el estado de UI cuando los props cambian. React NO lo hace automáticamente.

### 2. Generación de Distractores
**Problema inicial:** A veces la misma palabra aparecía como opción correcta y como distractor.

**Solución:** `getRandomItems()` con parámetro `exclude`:
```typescript
const distractors = getRandomItems(allWords, 3, [targetWord])
```

### 3. El Orden de los Ejercicios Importa
**Lección:** Flashcards primero (sin presión) → Picture Match (visual) → Listen (audio) → Spelling (escritura) → Fill Blank (parcial) → Final Test (mixto). Esta progresión de dificultad es esencial para un niño de 7 años. Saltar pasos causa frustración.

### 4. Hearts = 3 es el Número Mágico
**Lección:** Con 2 hearts el niño se frustra demasiado rápido. Con 4 no hay suficiente presión. 3 es el balance perfecto (como Duolingo original).
