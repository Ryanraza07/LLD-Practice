# LLD Practice Platform

A lightweight practice experience for low-level design interviews. The app helps a learner choose a problem, write a design, submit it for evaluation, and review past attempts with actionable feedback.

## Features

- Problem shortlist: Parking Lot, Vending Machine, Elevator System
- Text-based solution submission with loadable sample design
- Deterministic evaluation of class coverage and responsibilities
- Explainable feedback with strengths, gaps, and next steps
- Local attempt history to support iterative practice
- Minimal single-page architecture suitable for an MVP and future extension

## Run locally

1. Open a terminal in this project directory.
2. Start the app with:

   npm run dev

3. Visit the local dev server URL shown in the terminal (typically http://localhost:3000 or similar).

## Evaluate logic

Run the automated checks:

npm test

## Key files

- `index.html` — app shell and layout
- `script.js` — practice flow, UI state, and history management
- `evaluator.js` — evaluation engine and domain criteria
- `tests/evaluator.test.js` — regression tests for incomplete, weak, and strong designs
- `research.md` — brief problem and product research summary
- `design.md` — MVP design note and trade-offs
- `AI_USAGE.md` — AI-assisted decisions and accepted/rejected ideas

## MVP design choices

This project intentionally keeps the architecture simple:

- The UI is a static single-page app.
- The evaluation is synchronous and deterministic for core signals.
- Feedback is explainable rather than black-box.
- Local storage is used for attempt history, which is enough for a prototype without a backend.

## Limitations

- This is a prototype, not a production system.
- The evaluator is intentionally heuristic and focuses on structural signals, not deep semantic validation.
- AI assistance is reserved for coaching-style explanation; the actual scoring remains deterministic.
