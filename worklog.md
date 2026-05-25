---
Task ID: 1
Agent: Main Agent
Task: Fix spelling exercise - TTS saying "capital A, capital B" instead of just the letter, and reorder to word→spell→word

Work Log:
- Explored project structure and found all spelling/TTS code in /home/z/my-project/src/app/page.tsx
- Identified `spellAndSpeak()` function (line 116) as the root cause - used `letter.toUpperCase()` which makes TTS say "capital A"
- Fixed `spellAndSpeak()` to: (1) Say complete word first, (2) Spell each letter using lowercase (no "capital"), (3) Say complete word again at the end
- Added `onComplete` callback parameter to `spellAndSpeak()` so `isSpelling` state resets when speech finishes
- Updated `ListenChooseView` to pass `() => setIsSpelling(false)` as callback in both `playSpelling` and auto-spell useEffect
- FinalTestView uses `spellAndSpeak` without callback (simple button, no isSpelling state needed)
- Verified build succeeds with no errors

Stage Summary:
- Fixed: TTS no longer says "capital A, capital B" - uses lowercase letters for individual spelling
- Fixed: Spelling order is now word → spell letters → word (instead of spell → word)
- Improved: isSpelling state now resets after speech completes, allowing replay without advancing round
- Build: Successful

---
Task ID: 2
Agent: Main Agent
Task: Temporarily unlock all lessons so user can test any exercise without completing prerequisites

Work Log:
- Found `isUnlocked()` function in Dashboard component (line 296) that checks sequential completion
- Changed `isUnlocked` to always return `true` for all lessons
- Commented out original logic with clear "restore after testing" note
- Verified build succeeds

Stage Summary:
- All lessons are now selectable from the dashboard regardless of completion order
- Original sequential unlock code is preserved in comments for easy restoration
- Build: Successful
