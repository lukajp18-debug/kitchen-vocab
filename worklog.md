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

---
Task ID: 3
Agent: Main Agent + Full-stack Developer Subagent
Task: Build new Kitchen Vocabulary app with Week 34 vocabulary, reward system, and Duolingo-style exercises

Work Log:
- Analyzed uploaded "Vocabulary week 34.png" using VLM - extracted 10 kitchen/utensil words: spoon, fork, cup, pan, knife, glass, blender, plate, pot, kettle
- Analyzed 3 reward images: Panelita de leche (fudge squares), Gomas Trululu ChoColores (candy wrapper), Carro Hotwheels (Dodge Charger Hellcat)
- Generated 10 vocabulary images using AI image generation (cartoon-style, kid-friendly, white background)
- Generated 3 reward images: panelita (2D), trululu (3D), hotwheels (3D)
- Built complete app in /home/z/my-project/ with 6 exercise types:
  1. Learn the Words (flashcards) - 10 XP
  2. Match the Picture (image selection) - 80 XP
  3. Listen and Pick (TTS spelling + word selection) - 80 XP
  4. Spell the Word (scrambled letter tiles) - 80 XP
  5. Fill the Blank (missing letter) - 80 XP
  6. Show What You Know! (final test) - 120 XP
- Implemented 3-tier reward system:
  - Panelita de leche: unlocked at 2 lessons completed (33%)
  - Gomas Trululu: unlocked at 4 lessons completed (66%)
  - Carro Hotwheels: unlocked at 6 lessons completed (100%)
- Reward celebration with confetti, sparkles, glow effects, and "Claim your prize!" popup
- All lessons unlocked from start (testing mode)
- TTS uses correct spelling: word → lowercase letters → word (no "capital A")
- Verified build succeeds

Stage Summary:
- New Kitchen Vocabulary app fully built and running
- 10 vocabulary words with AI-generated cartoon images
- 3 real reward tiers with animated celebrations
- 6 Duolingo-style exercise types with hearts and XP
- Build: Successful
