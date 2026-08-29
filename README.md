# keypress — Typing Speed Test

A browser-based typing speed test built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies (aside from a Google Font).

Type the highlighted text as fast and accurately as you can. Get live WPM, accuracy, and a full results breakdown when the timer runs out.

## Features

- **Live stats** — WPM and accuracy update every second while you type
- **Character-level feedback** — correct characters turn white, mistakes are highlighted red
- **Animated caret** — a keycap-style cursor that visually "presses down" on each keystroke
- **Timed modes** — 15s / 30s / 60s / 120s
- **Difficulty levels**
  - **Beginner** — short, common words
  - **Medium** — standard mixed-length word list
  - **Advanced** — longer words, contractions, and punctuation
- **Results screen** — WPM, raw WPM, accuracy, and correct/total character count
- **Keyboard shortcut** — press `Tab` anytime to restart

## Tech Stack

- HTML5
- CSS3 (no frameworks)
- Vanilla JavaScript (no libraries)

## Project Structure

```
typing-test/
├── index.html    # markup
├── style.css     # styling
└── script.js     # test logic (word generation, timer, WPM/accuracy calculation)
```

## Getting Started

No installation needed — it's a static site.

1. Clone the repo:
   ```bash
   git clone https://github.com/shahed-ab/typingspeedtest.git
   ```
2. Open `index.html` in your browser.

That's it — no server, no build step, no `npm install`.

## How It Works

- **WPM formula**: `(correct characters / 5) / minutes elapsed` — the standard convention where 5 characters counts as one "word"
- **Accuracy**: `(correct characters / total characters typed) × 100`
- Each character in the prompt is rendered as its own `<span>`; as you type, spans are marked correct/incorrect in real time
- The caret's position is calculated by measuring the next untyped character's location in the DOM

## Live Demo

If GitHub Pages is enabled for this repo, you can play it here:
`https://shahed-ab.github.io/typingspeedtest/`

*(Enable it under Settings → Pages → Source: main branch, if not already on.)*

## Possible Next Steps

- Word-count mode (finish after N words instead of a timer)
- Results history saved locally
- Light/dark theme toggle
- Custom text input mode

## License

Free to use and modify.
