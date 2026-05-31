# Flujo 6: Sistema de Recompensas

## Skills Utilizados
- **`fullstack-dev`** — React state + animaciones CSS
- **`image-generation`** — Generación de imágenes de recompensas con IA

## Descripción del Flujo
Sistema de recompensas reales (físicas) con 3 niveles que motivan al niño a completar las lecciones. Las recompensas no son virtuales: el niño realmente las recibe en casa al completar cada nivel.

---

## Las 3 Recompensas

| Nivel | Recompensa | Lecciones Requeridas | Porcentaje | Tipo de Imagen |
|-------|-----------|---------------------|------------|----------------|
| 1 | Panelita de leche | 2 de 6 | 33% | 2D (foto real del producto) |
| 2 | Gomas Trululu | 4 de 6 | 66% | 3D (imagen generada) |
| 3 | Carro Hotwheels | 6 de 6 | 100% | 3D (imagen generada) |

### Definición en Código

```typescript
const REWARDS: RewardDef[] = [
  { id: 'panelita', name: 'Panelita de leche', image: '/images/rewards/panelita.png',
    lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
  { id: 'trululu', name: 'Gomas Trululu', image: '/images/rewards/trululu.png',
    lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: true },
  { id: 'hotwheels', name: 'Carro Hotwheels', image: '/images/rewards/hotwheels.png',
    lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: true },
]
```

---

## Flujo de Desbloqueo

```
1. Niño completa una lección
2. handleLessonComplete() se ejecuta
3. checkRewards() evalúa si una nueva recompensa debe desbloquearse
4. Si sí:
   a. Se agrega reward.id a unlockedRewards[]
   b. Se muestra celebración con confetti a pantalla completa
   c. El niño ve la imagen de la recompensa
5. La recompensa aparece en el dashboard como "desbloqueada"
```

### Código de Detección

```typescript
const checkRewards = useCallback((updatedProgress: ProgressData): RewardDef | null => {
  const lessonsCompleted = updatedProgress.completedLessons
    .filter((id) => LESSONS.some((l) => l.id === id)).length
  for (const reward of REWARDS) {
    if (!updatedProgress.unlockedRewards.includes(reward.id)
        && lessonsCompleted >= reward.lessonsRequired) {
      return reward  // Nueva recompensa desbloqueada!
    }
  }
  return null
}, [])
```

---

## Sistema de Celebración (Confetti)

### Generación de Confetti

```typescript
const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#FFD93D', '#6BCB77', '#9B59B6',
  '#58CC02', '#CE82FF', '#FF9600', '#FFC800'
]

function generateConfettiParticles() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 12,
    rotation: Math.random() * 360,
  }))
}
```

### Render del Confetti

```css
@keyframes confetti-fall {
  0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
```

- **60 partículas** con colores aleatorios
- Caen desde arriba con rotación
- Duración: 2-4 segundos por partícula
- Tamaño: 8-20px

### Overlay de Celebración

```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗   │
│  ║      🎉 CONFETTI ANIMATION 🎉    ║   │
│  ║                                   ║   │
│  ║    [Imagen de la Recompensa]      ║   │
│  ║                                   ║   │
│  ║    ¡Panelita de leche! 🥛         ║   │
│  ║    Complete 2 lessons (33%)        ║   │
│  ║                                   ║   │
│  ║    [Claim Reward! 🎁]             ║   │
│  ╚═══════════════════════════════════╝   │
└─────────────────────────────────────────┘
```

---

## Dashboard: Sección de Recompensas

En el dashboard principal se muestran las 3 recompensas con su estado:

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 🥛       │  │ 🍬       │  │ 🏎️       │
│ Panelita │  │ Trululu  │  │Hotwheels │
│  2/6 ✅  │  │  4/6 🔒  │  │  6/6 🔒  │
│ UNLOCKED │  │ LOCKED   │  │ LOCKED   │
└──────────┘  └──────────┘  └──────────┘
```

- **Desbloqueada:** Imagen a color + borde dorado + checkmark
- **Bloqueada:** Imagen en escala de grises + candado + progreso

---

## Manejo de Imágenes de Recompensas

### Iteración con el Usuario
**Requerimiento original:** "The first reward would be 'Panelita de leche' de 2D image. The second reward must be 'gomas trululu' de 3D image and the biggest reward 'Carro Hotwheels'."

**Iteración:** El usuario proporcionó una foto REAL de la Panelita de leche para reemplazar la imagen generada por IA.

**Lección:** Para productos reales que el niño va a recibir, usar fotos REALES del producto es mucho más motivador que ilustraciones genéricas. El niño ve la Panelita en la app y sabe EXACTAMENTE qué va a recibir.

### Archivos de Imagen
```
public/images/rewards/
├── panelita.png      ← Foto real subida por el usuario
├── trululu.png       ← Imagen 3D generada con IA
└── hotwheels.png     ← Imagen 3D generada con IA
```

---

## Lecciones Aprendidas

### 1. Recompensas Reales > Recompensas Virtuales
**Lección:** Un niño de 7 años se motiva MUCHO más con "voy a recibir un carro Hotwheels real" que con "voy a ganar 100 coins virtuales". Las recompensas tangibles mantienen la motivación a largo plazo.

### 2. 3 Niveles es el Número Correcto
- **Nivel 1 (33%):** Alcanzable rápido, el niño ve que el sistema funciona.
- **Nivel 2 (66%):** Requiere esfuerzo sostenido, pero no imposible.
- **Nivel 3 (100%):** La gran recompensa, la meta final.

**Lección:** Con solo 2 niveles, no hay progresión. Con 4+, el niño se abruma. 3 es el balance.

### 3. La Celebración es Tan Importante como la Recompensa
**Lección:** El confetti a pantalla completa + la imagen + el botón "Claim Reward" crean un momento emocional. Sin la celebración, desbloquear una recompensa se sentiría vacío. La dopamina del confetti es parte del diseño pedagógico.

### 4. is3D Flag para Imágenes de Mayor Impacto
**Decisión:** Las recompensas mayores (Trululu, Hotwheels) usan imágenes 3D para dar sensación de "cosa real". La Panelita usa foto 2D porque es un producto plano.
**Lección:** El tipo de imagen debe reflejar la naturaleza del premio real.
