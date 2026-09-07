# CLAUDE.md — Study APP Luka (Optimizado para Tokens)

## PROTOCOLO OBLIGATORIO

### Inicio de sesión
1. Leer este CLAUDE.md
2. Leer .claude-ref/ESTADO.md para ver progreso actual
3. Preguntar: "¿Cuál es la tarea de esta sesión?"

### Cierre de sesión
Actualizar .claude-ref/ESTADO.md con cambios y .claude-ref/GOTCHAS.md si hay problemas nuevos.

### Reglas críticas
- ❌ Nunca pasar a FASE 2 sin aprobación explícita
- ❌ Nunca entregar sin que npm run build pase limpio
- ✅ Fases: PLANEAR → EJECUTAR → VERIFICAR

## Contexto Rápido

**Proyecto:** Study APP — App educativa estilo Duolingo para Luka
**Stack:** Next.js 16, TypeScript, Tailwind, Firebase, SQLite/Prisma
**Idiomas:** Inglés/Español (next-intl)
**Estado actual:** Ver .claude-ref/ESTADO.md

## Características Principales
- Vocabulario inglés (cocina, vacaciones, acciones)
- Matemáticas (suma, resta, problemas, dinero, tiempo)
- Language Arts (artículos, there is/are, verbos)
- Sistema de XP, rachas, recompensas, leaderboard
- Bilingüe EN/ES

## Voz de Santiago para comunicaciones
Para cualquier texto dirigido a una persona (correos, mensajes,
documentación de cara a usuario), cargar y seguir las reglas de
~/.claude/skills/escritura-santiago/ antes de redactar.

## Reglas de Tokens

- Si sesión lleva >15 intercambios, advertir: "Considera iniciar sesión nueva"
- page.tsx tiene ~2700 líneas — leer solo secciones relevantes
- Para cambios en contenido educativo, editar src/data/topics.ts
