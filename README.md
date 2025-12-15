# MusaNet

MusaNet is a web-based, text-driven sheet music composer and player.
It allows users to type musical notation, see it rendered as traditional staff notation,
and play it back directly in the browser.

The project focuses on translating symbolic music notation into visual notation
and time-accurate audio playback using modern web technologies.

---

## Features

- Text-based music input (one measure per line)
- Traditional staff notation rendering
- Browser-based audio playback
- Support for rests and common note durations
- Local save/load library for compositions
- Interactive score (click to select notes, keyboard editing)
- Tempo control with transport playback (play / pause / stop)

---

## Notation Format

- One measure per line
- Optional time signature prefix

Example with time signature:

    3/4 | C4 q D4 q E4 q

Notes are written as:

    <pitch> <duration>

Rests are written as:

    R <duration>

Supported durations:

- w – whole
- h – half
- q – quarter
- e – eighth
- s – sixteenth

Full example:

    4/4 | C4 q R q D4 q R q

---

## Tech Stack

- Frontend: React + TypeScript
- Notation Rendering: VexFlow
- Audio Playback: Tone.js (Web Audio API)
- State Management: React hooks + custom state store
- Persistence: LocalStorage (composition library)
- Styling: SCSS
- Build Tool: Vite
- Testing: Jest

---

## Project Structure (High Level)

    src/
    ├── components/        UI components by feature
    ├── lib/
    │   ├── notation/      Parser, serializer, model, pitch, layout logic
    │   ├── audio/         Scheduler and Tone.js playback
    │   └── storage/       Composition persistence
    ├── state/             Editor and library state
    ├── pages/             Application pages
    ├── styles/            SCSS styles
    └── tests/             Unit tests for core logic

---

## Development

Install dependencies:

    npm install

Run the development server:

    npm run dev

Run tests:

    npm test

Build for production:

    npm run build

---

## Project Status

MusaNet is currently in a pre-refactor cleanup phase.

The current focus is on:
- Stability
- Save/load and library UX
- Playback correctness

A future refactor is planned toward a more advanced, MuseScore-like UI,
along with extended music features such as ties, richer time signature handling,
and import/export support.

---

## Disclaimer

Some portions of this codebase were partially generated with AI assistance
and subsequently reviewed, edited, and integrated by the project author.
