# US Geography Learning Map: Interactive Quiz & Minigame

Live demo (GitHub Pages):  
https://cse110-coblenz.github.io/cse-110-project-team-4/

An interactive US geography learning platform built with TypeScript, Konva, and Supabase.  
Players explore a topo-based US map, answer quiz questions, and unlock a minigame while tracking time, score, and mistakes.

---

## Overview

This project combines:

- A **topology-based US map** (states, small-state labels, rivers/mountains overlays),
- A **quiz engine** (capitals, flowers, history, etc.),
- A **timed gameplay loop** with score and error limits,
- A **minigame** for additional practice,
- And an optional **online leaderboard** backed by Supabase.

The goal is to feel like a small educational product, not just a one-off assignment.

---

## Key Features

- **Interactive US topo map**
  - `MapViewTopo` rendering real state shapes via **us-atlas + topojson-client + d3-geo (AlbersUSA)**.
  - Hover states with tooltips and tiny-state external labels.
  - Click interaction wired through `MapController` to drive quiz flow.

- **Quiz flow & question bank**
  - Question bank loaded from JSON (`src/data/questions/*.json`).
  - `QuizManager` coordinates map clicks → questions → correctness updates.
  - Multiple categories supported (capitals, flowers, history, etc.).
  - Timer, attempts, and basic progress tracking.

- **Minigame**
  - Launched via the main flow using a screen-switcher.
  - Designed as lightweight extra practice (e.g., simple matching / card-flip mechanics).

- **Timer, score, and stats**
  - `TimerModel` + `TimerController` + `TimerDisplayView` (corner timer on the map).
  - `ScoreModel` and `GameStateModel` track correct / incorrect answers and completion.
  - `GameStatsLightbox` displays summary stats (e.g., grey/green/red counts).

- **Leaderboard (Supabase)**
  - Supabase client in `src/supabaseClient.ts`.
  - `LeaderboardModel` + `LeaderboardView` to display top scores.
  - Environment-based configuration via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

- **Screen-based flow**
  - `ScreenSwitcher`-style orchestration in `src/main.ts`.
  - **Welcome screen** → **Map + Quiz** → **Minigame** → **Result screen** (+ leaderboard).

---

## Tech Stack

- **Language & tooling**
  - TypeScript, Vite
  - Vitest + jsdom for tests
- **Visualization**
  - Konva (2D canvas scene graph)
  - d3-geo, topojson-client, us-atlas
- **Backend / persistence**
  - Supabase (leaderboard & user data)
  - LocalStorage for lightweight client-side persistence
- **CI / deployment**
  - GitHub Actions (lint, typecheck, tests, build)
  - GitHub Pages for static hosting

---

## Getting Started (Development)

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# Open the shown localhost URL (usually http://localhost:5173/)

# Run tests
npm test

# Type-check
npm run typecheck

# Production build
npm run build
```

## Development History

**Integration Update v0.2 — Minigame, Screens, Supabase**  
_2025-11-19_  
- Introduced a **screen-based flow**:
  - `WelcomeScreenController` / `WelcomeScreenView`,
  - Main map + quiz screen,
  - `MinigameController` / minigame views,
  - `ResultScreenController` / `ResultScreenView`,
  - `ScreenSwitcher`-style orchestration in `main.ts`.
- Added **QuestionBankModel**, `QuestionFactory`, and JSON-backed question sets (`capitals`, `flowers`, `history`).
- Integrated **Supabase**:
  - `supabaseClient.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`,
  - `LeaderboardModel` + `LeaderboardView` for online scores.
- Refined Konva layer usage, HUD wiring, and CI/CD for GitHub Pages deployment.

**Integration Update v0.1 — Core Game Loop**  
_2025-11-05_  
- Integrated core systems into a single app:
  - `MapViewTopo` as the default map view,
  - `UIController` as a UI bus (map clicks → question overlay, freeze/unfreeze map),
  - `QuestionToggleController` + `QuestionToggleView` mounted into `#tool-bar`,
  - `GameStatsController` + `GameStatsLightbox` for summary stats,
  - `TimerModel` + `TimerController` + `TimerDisplayView` for countdowns.
- Added the initial **app shell** (`index.html` + `src/styles/app.css`), including:
  - `#map-root`, `#qa-box`, `#hud`, `#tool-bar`, `#overlay-root`, etc.
- GitHub Actions CI pipeline set up for linting, typechecking, tests, and builds.

**Stage 2 — TopoJSON Map**  
_2025-10-28 • branch: `feature/us-map-topo-#302`_  
- Replaced the tile map with a **TopoJSON + d3-geo + Konva.Path** map (`MapViewTopo`).  
- Added:
  - Real state shapes via **us-atlas** and `d3-geo`’s **AlbersUSA** projection,
  - Responsive canvas (ResizeObserver),
  - Hover effects (cursor change, soft lift) and status-based fills,
  - External labels for small states (chips + leader lines).

**Stage 1 — Tile Map Prototype**  
_2025-10-26 • branch: `feature/us-map-topo-#301`_  
- Built a **tile-based US map** using Konva + TypeScript.  
- Focused on hover/click interactions, status coloring, and a clean MVC split:
  - `models/` – `State.ts`, `StateStore.ts` (pub/sub store),
  - `views/` – `MapViewSquares.ts` (Konva rendering),
  - `controllers/` – `MapController.ts`, `UIController.ts`.
- Used demo timers and simple status cycling (NotStarted → Partial → Complete).
