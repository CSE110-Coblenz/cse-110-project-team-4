# CSE 110 Team 4 — Integration Update (v0.1)
_Date: 2025-11-05_ 
_credit: the README.md format was organized by ChatGPT._

> **Scope**: This README summarizes the big merge, current wiring, and the next steps for UI, data, and minigame work.  
> **Status note**: Toolbar has been temporarily moved to the **bottom-right**. No other UI visual changes have been made yet.

---

## What’s in this merge
- **Map (Topo)**: `MapViewTopo` now the default view (Konva + d3-geo + us-atlas).
- **UI Bus**: `UIController` bridges map clicks → open question flow (overlay), freezes/unfreezes map interaction.
- **Question Toggle Menu**: `QuestionToggleController` + `QuestionToggleView`, mounted into `#tool-bar` (Konva canvas in DOM header).
- **Game Stats Lightbox**: `GameStatsController` wiring to show/update counts.
- **Timer**: `TimerModel` + `TimerController` + `TimerDisplayView` (Konva widget).
- **Styles**: `src/styles/app.css` with basic app shell (toolbar, hud, main area, portals).

---

## How to run
```bash
npm install
npm run dev
# open the shown localhost URL
```

## UI structure (DOM containers)
```
#app-root.app-shell
 ├─ header#tool-bar     ← QuestionToggleView (Konva canvas)
 ├─ main#main-area
 │   ├─ div#map-root    ← MapViewTopo (Konva Stage)
 │   └─ div#qa-box      ← (reserved) Question overlay Stage (planned)
 ├─ aside#hud           ← score/time HUD (DOM; planned: score here)
 ├─ div#portal-root     ← modals/drawers (reserved)
 ├─ div#toast-root      ← toasts (reserved)
 └─ div#overlay-root    ← full-page overlay (reserved)
```

**Temporary note**: Toolbar is currently positioned **bottom-right** via CSS. We can switch to top-right/top-left later as needed.

---

## Konva stages & layers (current)
- **Map Stage** (container: `#map-root`):
  - `baseLayer` (state paths, fills by status)
  - `abbrevLayer` (two-letter state codes)
  - `uiLayer` (tooltip text/background, listening:false)
  - `externalLabelsLayer` (tiny state chips + leader lines)
  - `overlayLayer` (from `UIController`, used when opening questions; may be disabled locally during troubleshooting)
  - _Timer_ layer (timer widget) — if attached to the map stage
  - _GameStats_ layer (lightbox) — attached by `GameStatsController`

> Depending on what is toggled, you may see **5–8 layers**. Target is **3–4** total after cleanup.

---

## Next steps (shortlist)
1. **UI structure**: split “UI widgets” from “containers”, consolidate into fewer layers (target 3–4).  
2. **Data layer**: connect **QuestionBank / User / Score / Leaderboard** models; wire persistence & reset flows.
3. **Minigame**: define minimal APIs and state transitions; render with its own controller/view, not inside `main.ts`.

---

## Component change map (where to look & how to control)

### 1) Game Stats Lightbox
- **Files**:  
  - Controller: `src/controllers/GameStatsController.ts`  
  - View: `src/views/GameStatsLightbox.ts`
- **Mount point**: currently **on the Map Stage** (`#map-root`) inside a Konva `Layer`, added by the controller.
- **Create & show** (in `main.ts`):
  ```ts
  const stats = new GameStatsController(map); // map: MapController
  // stats is auto-mounted into the map’s Stage if available
  // Update counts:
  stats.updateCounts(grey, green, red);
  ```
- **Visibility**: the lightbox group lives in a `Layer({ listening:false })`. To hide/show, either set the **group** visible flag (if exposed by the view), or set the **layer** visible flag and `layer.batchDraw()`.

> _Planned option_: allow `new GameStatsController(map, "hud")` to mount into a **separate Stage** in `#hud` instead of map Stage.

---

### 2) Questions (overlay) / QuestionCard
- **Files**:  
  - Controller: `src/controllers/UIController.ts`  
  - Views: `src/views/QuestionCardView.ts` (and/or `src/views/QuestionOverlayView.ts`)  
  - Map → UI Bus: `src/controllers/MapController.ts` (calls `uiBus.goToQuestionsFor(s)`)  
- **Current behavior**: clicking a state cycles status in the store and calls the UI bus; the UI opens a question overlay layer on the **map Stage** and freezes map interaction.
- **API**:
  ```ts
  ui.openQuestion(questionLike); // shows overlay
  ui.closeQuestion();            // hides overlay & unfreezes map
  ```
- **Data**: the view is display-only; question data comes from `UIController.goToQuestionsFor()` (mock) or future wiring to `QuestionBank`.
- **Planned**: host the card in a **dedicated Stage under `#qa-box`**, not inside the map Stage; keep map overlay minimal (just a click-swallow mask) or remove it.

---

### 3) Timer
- **Files**:  
  - Model: `src/models/TimerModel.ts`  
  - Controller: `src/controllers/TimerController.ts`  
  - View: `src/views/TimerDisplayView.ts` (Konva)  
- **Mount point**: currently on the **map Stage**; positioned at top center/right depending on `relayout()` logic.
- **Create & start** (in `main.ts`):
  ```ts
  const timerView = new TimerViewCorner(stageForUI);      // Konva Stage from map
  const timerCtrl = new TimerController(new TimerModel(300), timerView);
  timerCtrl.start();
  // timerCtrl.stop() to stop
  ```
- _Planned_: alternative DOM HUD timer to reduce Konva layers if desired.

---

### 4) Question Toggle Menu
- **Files**:  
  - Controller: `src/controllers/QuestionToggleController.ts`  
  - View: `src/views/QuestionToggleView.ts`  
- **Mount point**: `header#tool-bar` DOM container (Konva Stage created inside it).  
- **Manual test path** 
  - Buttons will render in the toolbar; open the console to see outputs (“Go Back” prints next question info, “Save” resets/updates types, “Toggle …” flips options).
- **Common issues**:
  - If you can see the panel but can’t click: ensure `show()` recomputes size and calls `layer.draw()`/`stage.draw()`.
  - Make sure `#tool-bar` has a non-zero size and high z-index; see `src/styles/app.css`.

---

## Current containers & layer status (quick glance)
- **DOM containers**: `#tool-bar` (bottom-right, Konva toolbar), `#map-root` (map Stage), `#qa-box` (question card), `#hud` (score/time DOM planned).
- **Konva**: map Stage has ~ **5–8 layers** (base/abbrev/ui/external/overlay/timer/lightbox…). **Goal: 3–4** after merging overlay & widgets into fewer layers or moving to DOM where appropriate.

---

## Known issues / tips
- **Konva warning**: “Stage has 7 layers” — expected for now; will be addressed by consolidation.
- **Toolbar invisible / can’t click**:
  - Ensure `QuestionToggleView.show()` recomputes size and draws.
  - Make `#tool-bar` z-index higher than map; give it `min-height` to avoid 0-height first render.
- **Question not opening**:
  - Check that `map.setUIBus(ui)` is called after `ui.init(stage)`; ensure `onStateClick` calls `uiBus.goToQuestionsFor(s)`.

---

## Work queue (short-term)
- Move **Questions** to `#qa-box` Stage; keep the map overlay minimal.
- Move **Score** to **DOM HUD**; keep **Timer** on map (or switch to DOM if needed).
- Reduce Konva layers to 3–4 (merge overlay/card widgets into one layer where possible).
- Wire `QuestionBank` to `UIController.goToQuestionsFor()`; replace mock.
- Add a clean “router/screen-switcher” (later).

---

## Code search cheat-sheet
- Map click → UI: `onStateClick` in `src/controllers/MapController.ts`
- Open/close question: `openQuestion/closeQuestion` in `src/controllers/UIController.ts`
- Toggle menu: `src/controllers/QuestionToggleController.ts`, `src/views/QuestionToggleView.ts`
- Timer: `src/controllers/TimerController.ts`, `src/views/TimerDisplayView.ts`
- Lightbox: `src/controllers/GameStatsController.ts`, `src/views/GameStatsLightbox.ts`

---



# US Map – Stage 2 (TopoJSON View) — 10/28/2025 Dennis
    branch: feature/us-map-topo-#302
    Topo-based US map rendered with **Konva Paths** using **TopoJSON to GeoJSON** and **d3-geo**’s AlbersUSA projection. Replaces the Stage-1 tile demo while keeping the same MVC wiring.

    Features
        -Real state shapes via us-atlas + topojson-client + d3-geo (AlbersUSA + fitSize)
        -Responsive & centered canvas (ResizeObserver + container CSS)
        -Hover: pointer cursor, slight scale-up, soft shadow（raised only within canvas）
        -Click: fires UI callback; demo cycles status (white=NotStarted, pink=Partial, green=Complete)
        -Incremental redraw on store updates (update fills only; no geometry rebuild)
        -Territories skipped (AS/GU/MP/PR/VI) to reduce console noise

# US Map – Stage 1 (Tile square Demo) 10/26/2025 Dennis
    branch: feature/us-map-topo-#301
    Tile-based US map prototype using **Konva + TypeScript**.  
    Goal: fast, testable UI for hover/click interactions and quiz status coloring.
    
    Features
        Labeled tiles for a subset of states (seed data)
        Status colors: white=NotStarted, pink=Partial, green=Complete
        Hover: pointer, slight scale-up, drop shadow
        Click: triggers UI callback; cycles status (NotStarted→Partial→Complete→NotStarted)
        Auto redraw on store updates
        Demo timers: CA→Complete (1s), TX→Partial (1.5s)
    
    MVC split (Model/Store, Controller, View) → data/UI separation, easy to swap TopoJSON later
    
    Architecture (MVC)
    src/
    models/        # State.ts, StateStore.ts (pub/sub store)
    views/         # MapViewSquares.ts (Konva rendering)
    controllers/   # MapController.ts (wires view↔store), UIController.ts (navigation hook)
    main.ts        # bootstraps and mounts to <div id="map-container">

# Next (Stage 2 – Real Map)
    Replace MapViewSquares with MapViewTopo (TopoJSON + d3-geo + Konva.Path)
