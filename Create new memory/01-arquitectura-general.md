# Flujo 1: Arquitectura General de la Aplicación

## Skill Principal Utilizado
**`fullstack-dev`** — Fullstack web development con Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui

## Descripción del Flujo
Construcción de una aplicación web de aprendizaje de vocabulario estilo Duolingo para un niño de 7 años (primer grado), orientada a enseñar 10 palabras de cocina en inglés: pronunciación y deletreo.

---

## Stack Tecnológico Final

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | Next.js 16 (App Router) | SSR/SSG + API Routes en un solo proyecto |
| Lenguaje | TypeScript | Tipado estricto para evitar bugs en ejercicios |
| Estilos | Tailwind CSS 4 + Custom CSS | Sistema de animaciones propio (duo-*) |
| UI Components | shadcn/ui (Radix) | Botones, Cards, Progress bars accesibles |
| Base de Datos | Vercel Postgres (Neon) | Persiste en serverless (SQLite NO funciona en Vercel) |
| TTS | Web Speech API (navegador) | Sin costo, funciona offline, sin API externa |
| Deployment | Vercel + GitHub | CI/CD automático, gratis |

---

## Estructura de Archivos Clave

```
src/
├── app/
│   ├── api/progress/route.ts    ← API REST para progreso (GET/POST)
│   ├── globals.css               ← Animaciones custom (shake, slide-up, pulse-grow)
│   ├── layout.tsx                ← Layout raíz con metadatos
│   └── page.tsx                  ← APP ENTERA (~2000 líneas, monolítica)
├── components/ui/                ← shadcn/ui components
├── hooks/                        ← use-mobile, use-toast
└── lib/
    ├── db.ts                     ← Prisma singleton (legado, ya no se usa)
    └── utils.ts                  ← cn() helper

public/images/
├── kitchen/                      ← 10 PNGs de vocabulario
└── rewards/                      ← 3 imágenes de recompensas
```

---

## Arquitectura de Estado (Monolítica en page.tsx)

```
KitchenVocabApp (componente raíz)
├── studentName: string           ← Nombre del estudiante
├── view: ViewType                ← Vista activa (dashboard, ejercicio, etc.)
├── progress: ProgressData        ← XP, streak, completedLessons, unlockedRewards
├── currentLessonId               ← Lección en curso
├── pendingReward                 ← Recompensa pendiente de celebración
├── isHydrated                    ← Flag para evitar flash de datos vacíos
└── welcomeBack                   ← Mostrar "Welcome back!" si tiene XP
```

### Flujo de Vistas (ViewType)

```
'dashboard' → Lección seleccionada → [ejercicio] → 'lesson-complete' | 'game-over'
                                                              ↓
                                                     'dashboard' (con XP actualizado)
```

---

## Decisiones Arquitectónicas y Lecciones Aprendidas

### 1. Archivo Único vs. Múltiples Componentes
**Decisión:** Toda la app en un solo `page.tsx` (~2000 líneas).
**Por qué:** Velocidad de desarrollo, no hay que manejar imports cruzados ni contexto compartido. El estado se pasa todo por props desde el componente raíz.
**Lección:** Funciona bien para apps pequeñas. Si la app crece a más de 2 temas de vocabulario, habría que dividir en componentes separados con un context provider.

### 2. Sin Librería de Estado (Zustand instalado pero no usado)
**Decisión:** Usar `useState` + `useCallback` + `useRef` en el componente raíz.
**Por qué:** Para una app de un solo estudiante en un solo dispositivo, el estado local es suficiente. No hay necesidad de stores globales.
**Lección:** No sobre-ingeniar. El `useState` simple funciona perfectamente si toda la lógica está en un componente.

### 3. CSR vs SSR
**Decisión:** `'use client'` en page.tsx. Toda la app es Client-Side Rendering.
**Por qué:** La app usa `localStorage`, `window.speechSynthesis`, y manejo de estado interactivo que requiere el navegador.
**Lección:** Para apps interactivas tipo juego, CSR es la opción correcta. Solo las API routes necesitan ser server-side.

### 4. CSS Custom vs. Tailwind Puro
**Decisión:** Tailwind para layout + clases CSS custom para animaciones del juego (`.duo-button`, `.spelling-slot`, `.letter-tile`, `animate-shake`, `animate-slide-up`, `animate-pulse-grow`).
**Por qué:** Las animaciones de Duolingo son específicas y no se logran solo con utilidades de Tailwind.
**Lección:** Combinar Tailwind con CSS custom es la forma más rápida. No intentar hacer todo con utilidades.

---

## Error Crítico Evitado: Flash de Datos Vacíos

**Problema:** Si el componente renderiza antes de cargar el progreso guardado, muestra XP=0 y luego salta al valor real (flash visual).

**Solución:** Flag `isHydrated` que bloquea el render del dashboard hasta que el progreso se carga desde localStorage/API:

```typescript
const [isHydrated, setIsHydrated] = useState(false)
// ... cargar progreso ...
setIsHydrated(true)  // Solo después de cargar
```

Si `!isHydrated`, se muestra un spinner de carga.
