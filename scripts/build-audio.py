"""Records the lesson audio once, so every phone and tablet says the same thing.

The browser's own voice (speechSynthesis) differs per device and mispronounces single
letters ("A" as "I", "G" as "C"). This script synthesizes the letters A-Z, "double", every
vocabulary word and every sentence/question the lessons read, with one free English neural
voice, and writes them to public/audio/en/ plus a manifest the app looks texts up in.

    python scripts/build-audio.py            # only generates what is missing
    python scripts/build-audio.py --force    # regenerates everything

Run it again whenever a new week of vocabulary is added. Needs: pip install edge-tts, and
ffmpeg + node on the PATH. Audio is generated with Microsoft's neural voice service through
the edge-tts package (free, for this family app; not for redistribution).
"""
import asyncio
import hashlib
import json
import re
import string
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "en"
VOICE = "en-US-AriaNeural"
RATE = "-10%"
FORCE = "--force" in sys.argv


def norm(text: str) -> str:
    """Same normalization as src/lib/speech.ts (key used to find a recording)."""
    return re.sub(r"\s+", " ", text.strip().lower())


def spoken(text: str) -> str:
    """Text as the voice should read it: ALL-CAPS words become normal words (not initials)."""
    return re.sub(r"\b[A-Z]{2,}\b", lambda m: m.group(0).lower(), text)


def file_for(kind: str, text: str) -> str:
    if kind == "letter":
        return f"l-{text}.mp3"
    if kind == "word":
        return f"w-{text}.mp3"
    return "p-" + hashlib.sha1(norm(text).encode()).hexdigest()[:10] + ".mp3"


async def synth(text: str, dest: Path) -> None:
    raw = dest.with_suffix(".raw.mp3")
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(raw))
    # trim the silence around the speech, mono, small file
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(raw),
         "-af", "silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.05,"
                "areverse,silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.08,areverse",
         "-ac", "1", "-ar", "24000", "-b:a", "48k", str(dest)],
        check=True,
    )
    raw.unlink()


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    found = json.loads(subprocess.run(["node", str(ROOT / "scripts" / "audio-texts.mjs")],
                                      capture_output=True, text=True, check=True, cwd=ROOT).stdout)
    jobs = []  # (key, kind, text-to-say, file)
    for ch in string.ascii_lowercase:
        jobs.append((f"letter:{ch}", "letter", ch.upper(), file_for("letter", ch)))
    jobs.append(("double", "word", "double", "x-double.mp3"))
    for w in found["words"]:
        jobs.append((norm(w), "word", w, file_for("word", w)))
    for p in found["phrases"]:
        jobs.append((norm(p), "phrase", spoken(p), file_for("phrase", p)))

    manifest = {}
    made = 0
    for key, kind, text, fname in jobs:
        dest = OUT / fname
        if FORCE or not dest.exists():
            for attempt in range(3):
                try:
                    await synth(text, dest)
                    break
                except Exception as e:  # network hiccup: retry
                    if attempt == 2:
                        raise
                    print("retry", key, type(e).__name__)
                    await asyncio.sleep(1.5)
            made += 1
            print("recorded", fname, "<-", text)
        manifest[key] = fname

    (OUT / "manifest.json").write_text(json.dumps({"voice": VOICE, "files": manifest}, indent=1, sort_keys=True))
    total = sum(f.stat().st_size for f in OUT.glob("*.mp3"))
    print(f"{len(manifest)} texts, {made} newly recorded, {total/1024:.0f} KB")


asyncio.run(main())
