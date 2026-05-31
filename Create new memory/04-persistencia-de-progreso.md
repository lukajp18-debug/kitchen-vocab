# Flujo 4: Persistencia de Progreso

## Skills Utilizados
- **`fullstack-dev`** — Next.js API Routes + Vercel Postgres
- **Ingeniería de persistencia** — localStorage + Cloud DB dual

## Descripción del Flujo
Sistema de guardado de progreso del estudiante que evolucionó a través de 3 iteraciones, desde un enfoque ingenuo hasta una solución robusta que funciona en mobile y Vercel serverless.

---

## Evolución del Sistema (3 Iteraciones)

### Iteración 1: Solo SQLite/Prisma (FALLÓ)
```
Cliente → API Route → Prisma → SQLite (file:./db/custom.db)
```

**Problema:** En Vercel, el filesystem es efímero. Cada vez que el serverless function se reinicia (cada hora o menos), el archivo SQLite se pierde. El niño vuelve y su progreso es 0.

**Lección:** NUNCA usar SQLite en Vercel. SQLite solo funciona en servidores persistentes (VPS, dedicated server).

### Iteración 2: Dual localStorage + SQLite (FALLÓ)
```
Al cargar:  localStorage ← mejor de → API/SQLite
Al guardar: localStorage → API/SQLite
```

**Problema 1:** iOS Safari puede limpiar localStorage para liberar espacio.
**Problema 2:** SQLite sigue siendo efímero en Vercel.
**Problema 3:** Si localStorage se limpia Y SQLite se reinicia, el progreso se pierde completamente.

### Iteración 3: localStorage + Vercel Postgres (SOLUCIÓN FINAL)
```
Al cargar:  localStorage ← mejor de → Vercel Postgres (cloud)
Al guardar: localStorage + Vercel Postgres (ambos)
Al cerrar:  visibilitychange → guardar en Postgres
```

---

## Arquitectura Final de Persistencia

### Capa 1: localStorage (Siempre Disponible)

```typescript
function saveProgressLocal(progress: ProgressData) {
  // DEFENSIVA: Nunca sobreescribir datos existentes con datos vacíos
  const existing = localStorage.getItem('kitchen-vocab-progress')
  if (existing) {
    const existingData = JSON.parse(existing)
    if (progress.xp === 0 && existingData.xp > 0) {
      return  // NO sobreescribir progreso real con ceros
    }
  }
  localStorage.setItem('kitchen-vocab-progress', JSON.stringify(progress))
}

function forceSaveProgressLocal(progress: ProgressData) {
  // Fuerza guardado sin protección (solo para sync inicial desde DB)
  localStorage.setItem('kitchen-vocab-progress', JSON.stringify(progress))
}
```

### Capa 2: Vercel Postgres (Persistente en Cloud)

```sql
CREATE TABLE IF NOT EXISTS students (
  name VARCHAR(255) PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  completed_lessons TEXT DEFAULT '[]',     -- JSON stringificado
  unlocked_rewards TEXT DEFAULT '[]',      -- JSON stringificado
  last_played_date TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**API Route:**
- `GET /api/progress?name=Santiago` → Cargar progreso
- `POST /api/progress` → Guardar progreso (upsert por nombre)

**Característica clave:** `ensureTable()` auto-crea la tabla si no existe, así funciona inmediatamente después de conectar la DB.

### Capa 3: Guardado en Cierre de Página (Mobile-Critical)

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && isHydrated && studentName) {
      const currentLocal = loadProgressLocal()
      saveProgressToDB(studentName, currentLocal)
    }
  }
  const handleBeforeUnload = () => {
    if (isHydrated && studentName) {
      const currentLocal = loadProgressLocal()
      saveProgressToDB(studentName, currentLocal)
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, [isHydrated, studentName])
```

**Por qué `visibilitychange`:** En iOS Safari, `beforeunload` NO se dispara cuando el usuario cambia de app o cierra la pestaña. `visibilitychange` con `document.visibilityState === 'hidden'` SÍ se dispara.

---

## Flujo Completo de Carga de Progreso

```
1. App se monta
2. ¿Hay nombre guardado en localStorage?
   ├── NO → Mostrar pantalla "What's your name?"
   └── SÍ → Cargar localStorage + llamar API
              ├── API funciona → Comparar XP, elegir el MAYOR
              │   ├── DB tiene más XP → Usar DB, forzar save a localStorage
              │   └── localStorage tiene más → Usar local, forzar save a DB
              └── API falla → Usar localStorage solamente
3. Calcular streak (mismo día / ayer / nuevo)
4. setProgress(bestProgress)
5. setIsHydrated(true) → Mostrar dashboard
```

## Flujo Completo de Guardado

```
Cada vez que progress cambia (useEffect):
  ├── saveProgressLocal(progress)    → localStorage (con protección defensiva)
  └── saveProgressToDB(name, progress) → API → Vercel Postgres

Cuando la página se oculta/cierra:
  └── saveProgressToDB(name, loadProgressLocal())  → Último respaldo
```

---

## Modelo de Datos (ProgressData)

```typescript
interface ProgressData {
  xp: number               // Puntos acumulados
  streak: number            // Días consecutivos
  completedLessons: string[] // IDs de lecciones completadas
  unlockedRewards: string[]  // IDs de recompensas desbloqueadas
  lastPlayedDate: string     // "YYYY-MM-DD" para cálculo de streak
}
```

---

## Lecciones Aprendidas

### 1. SQLite en Vercel = Progreso Perdido
**Error:** Asumir que SQLite persistiría en Vercel. El filesystem de serverless es efímero por diseño.
**Lección:** Si despliegas en serverless (Vercel, Netlify, AWS Lambda), SIEMPRE usa una base de datos externa (Postgres, MySQL, Turso, MongoDB Atlas).

### 2. localStorage es Frágil en Mobile
**Error:** Confiar solo en localStorage. iOS Safari lo puede limpiar para liberar espacio.
**Lección:** localStorage es un CACHE, no una base de datos. Siempre tener un respaldo en la nube.

### 3. La Protección Defensiva es Esencial
**Problema:** Si el componente se re-renderiza con estado vacío (ej: durante hydration), puede sobreescribir el progreso guardado con ceros.
**Solución:** `saveProgressLocal()` rechaza sobreescribir datos existentes con datos vacíos. `forceSaveProgressLocal()` solo se usa cuando estamos seguros de que los datos son correctos (sync inicial desde DB).

### 4. `visibilitychange` > `beforeunload` en iOS
**Lección:** En iOS Safari, `beforeunload` no es confiable. `visibilitychange` se dispara correctamente cuando el usuario sale de la app. Ambos handlers son necesarios para cubrir desktop y mobile.

### 5. Graceful Degradation
**Lección:** La API route tiene try/catch que devuelve datos vacíos si la DB falla. Esto permite que la app funcione incluso sin la DB configurada, usando localStorage como fallback. El usuario nunca ve un error, simplemente la persistencia no es tan confiable.
