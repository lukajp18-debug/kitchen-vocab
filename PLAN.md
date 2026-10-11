# PLAN — Embellecida visual de Study App

Fecha: 2026-10-11 · Base: diagnóstico Fase 0 · Estado: **pendiente de aprobación**

## Decisiones tomadas

| Tema | Decisión | Por qué |
|---|---|---|
| Idioma | Bilingüe ES/EN bien hecho: todos los textos pasan por `next-intl`/`I18nProvider`. El selector deja de flotar y entra al menú de ajustes. | Hoy `page.tsx` tiene textos fijos en inglés y el selector tapa racha, XP y corazones. |
| Mascota | SVG propio con 5 estados (normal, feliz, pensando, ánimo, celebra). Personaje a elegir entre las opciones del boceto. | El emoji 🦉 se ve distinto en cada teléfono y no puede reaccionar. |
| Identidad | Look propio: índigo como color de marca (ya aparece en pestañas y banners), verde **solo** para "correcto / continuar", amarillo sol para premios, coral suave para errores. | Deja de parecer una copia de Duolingo y le da a cada color un significado fijo. |
| Animación | `framer-motion` (ya instalado), cargado con `LazyMotion` + `m` para no subir el bundle. CSS para lo repetitivo (fondo, flotar). | Cero dependencias nuevas. |
| Sonidos | Generados en el navegador con Web Audio (0 KB): acordes cortos y suaves, no "bips". Botón de silencio guardado en el dispositivo. Vibración corta en Android (iPhone no la soporta). | Sin archivos ni licencias, y suenan mejor que un bip si se arman como acordes. |
| Monedas y niveles | **Niveles sí**, calculados del XP (solo visual). **Monedas no.** | Unas monedas sin tienda serían otro número sin uso. El nivel sí le dice al niño "estás creciendo". |
| Modo oscuro | Botón en ajustes (claro / oscuro), guardado en el dispositivo, con `next-themes` (ya instalado). | Pedido explícito. |
| Game over | Se mantienen los corazones (son regla de juego actual), pero la experiencia se suaviza: al fallar se muestra la respuesta correcta con calma; al quedarse sin corazones, "¡Casi lo logras!" con la mascota animando y el XP ganado. | No cambia la lógica y quita lo castigador. |

## 1. Sistema de diseño

### Paleta (tokens CSS en `globals.css`, con versión oscura)
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--brand` | `#5B4BFF` índigo | `#8B7FFF` | Marca, pestañas activas, encabezados |
| `--brand-soft` | `#ECEAFF` | `#2A2550` | Fondos de tarjetas de marca |
| `--go` | `#3DBE29` verde | `#4FD63A` | Correcto, Continuar, progreso |
| `--go-shadow` | `#2E9420` | `#2E9420` | Relieve de botones verdes |
| `--sun` | `#FFC23D` | `#FFCF5C` | XP, premios, racha |
| `--oops` | `#FF7A6B` coral | `#FF8F82` | Error amable (no rojo puro) |
| `--sky` | `#2BB3FF` | `#5CC6FF` | Audio, pistas, info |
| `--bg` | `#FFF9F2` crema | `#14122B` | Fondo general |
| `--surface` | `#FFFFFF` | `#1F1C3D` | Tarjetas |
| `--ink` | `#2B2A45` | `#F2F0FF` | Texto principal |
| `--ink-soft` | `#6B6987` | `#B5B2D6` | Texto secundario (cumple AA) |
| `--line` | `#E8E4F5` | `#34305C` | Bordes |

Los colores de cada lección y tema (`topics.ts`) se mantienen como acentos.

### Tipografía
- **Nunito** (redonda, muy legible para niños) vía `next/font/google`, pesos 600/800/900.
- Escala: 12 · 14 · 16 · 20 · 24 · 32 · 44 px. **Mínimo 12 px** en toda la app (hoy hay 10 px).

### Espaciado, radios, bordes y sombras
- Espaciado en múltiplos de 4: 4 · 8 · 12 · 16 · 24 · 32.
- Radios: 12 (chips), 20 (botones), 28 (tarjetas), 9999 (píldoras).
- Bordes de 2 px con `--line`; tarjetas con relieve inferior de 4 px (borde inferior más oscuro).
- Sombra suave única: `0 6px 20px rgb(43 42 69 / 0.08)`.

### Botones (componente `KidButton`)
- Variantes: `go` (verde), `brand`, `soft` (secundario), `ghost`.
- Alto mínimo 52 px; toques de 48×48 px o más en todo lo tocable.
- Estados: reposo (relieve 4 px) · hover (sube 1 px) · presionado (baja 3 px, relieve 1 px, 100 ms) · deshabilitado (gris, sin relieve) · cargando (puntos animados).

## 2. Sistema de movimiento

- **Librería:** framer-motion con `LazyMotion` (`domAnimation`).
- **Duraciones:** micro (tocar, hover) 150 ms · cambio de pregunta 250 ms · cambio de pantalla 300 ms · celebraciones hasta 1.2 s (son eventos únicos).
- **Curvas:** entrada `easeOut` `[0.22, 1, 0.36, 1]`; salida `easeIn` 200 ms; rebotes con resorte (`stiffness 400, damping 22`).
- **Qué se anima:** cambio de pantalla (deslizar + desvanecer), cambio de pregunta (sale a la izquierda, entra por la derecha), feedback (hoja que sube desde abajo), barras de progreso (llenado con resorte + destello al avanzar), XP (conteo de 0 al total), racha (llama que late), mascota (respira, parpadea, reacciona), fondo (formas que flotan muy lento).
- **Qué NO se anima:** texto de lectura, inputs mientras se escribe, listas largas, el admin.
- **`prefers-reduced-motion`:** con `MotionConfig reducedMotion="user"` y una regla CSS global, todo queda en fundidos cortos, sin confeti ni fondo en movimiento.

## 3. Mejoras priorizadas por fases

Cada fase: aviso previo → cambios → app corriendo → capturas antes/después → commit.

| Fase | Qué | Pantallas | Impacto | Esfuerzo |
|---|---|---|---|---|
| **2. Cimientos** | Tokens de color, fuente Nunito, modo oscuro con botón, menú de ajustes (idioma, tema, sonido) que reemplaza el selector flotante, `prefers-reduced-motion`, animaciones que faltan definidas, mínimos de tamaño de texto y de toque. | Todas (global) | Alto | Medio |
| **3. Textos bilingües** | Todos los textos de `page.tsx` y las vistas de lecciones pasan a ES/EN. | Todas las de estudio | Alto | Medio |
| **4. Mascota** | SVG con 5 estados + componente `Mascota` que reacciona. Reemplaza al 🦉 en carga, nombre, dashboard, lecciones, fin y game over. | 7 pantallas | Muy alto | Medio |
| **5. Feedback de respuesta** | Hoja inferior de acierto/error (verde celebrando / coral amable con la respuesta correcta), sonidos, vibración, corazón que se rompe suave. Un componente compartido para las 4 familias de lecciones. | Las 22 lecciones | Muy alto | Alto |
| **6. Transiciones** | Entre pantallas y entre preguntas. | Toda la navegación | Alto | Medio |
| **7. Fin de lección y premios** | Conteo de XP, racha, barra de nivel que sube, "¡Casi lo logras!", modal de recompensa renovado. | Fin, game over, recompensa | Muy alto | Medio |
| **8. Inicio y dashboard** | Encabezado con racha, nivel y XP vivos; fondo animado; camino de lecciones en zigzag con nodos; tarjetas de tema con relieve; pestañas renovadas. | Temas, dashboard | Muy alto | Alto |
| **9. Carga y rendimiento** | Esqueletos (entrada, dashboard, liga); imágenes pesadas a WebP (≈5 MB menos); `manifest.json` con nombre e ícono PNG correctos. | Carga, liga, PWA | Medio | Bajo |
| **10. Tablet y accesibilidad** | Diseño a 2 columnas en tablet, etiquetas `aria` en botones con emoji, contraste AA verificado, repaso final. | Todas | Medio | Medio |

Niveles (fase 7–8): nivel = 1 + XP ÷ 150, redondeado hacia abajo; la barra muestra el avance al siguiente nivel. Solo se calcula en pantalla, no se guarda.

## 4. Qué NO vamos a cambiar

- **Lógica de lecciones, XP, corazones, recompensas y racha:** reglas del juego que ya funcionan; solo cambia cómo se ven.
- **Rutas, autenticación, Firestore y el modelo de datos:** fuera del alcance visual y con riesgo de perder progreso.
- **Contenido educativo** (`src/data/*`): viene del colegio.
- **Panel `/admin`:** no lo usa el niño.
- **Estructura de `page.tsx`:** no se reorganiza; se crean componentes nuevos en `src/components/kid/` y se usan desde ahí. Reorganizar 3 000 líneas es riesgo sin beneficio visual.
- **Dependencias:** ninguna nueva; framer-motion, next-themes y next/font ya están.

## 5. Riesgo conocido
`next.config.ts` tiene `ignoreBuildErrors: true`: el build no detecta errores de tipos. En cada fase corro además `npx tsc --noEmit` sobre los archivos tocados.
