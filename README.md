# Lab2
Fresh repository with main branch.

# US Map – Stage 1 (Tile square Demo)
    Tile-based US map prototype using **Konva + TypeScript**.  
    Goal: fast, testable UI for hover/click interactions and quiz status coloring.
# Quick Start
    ```bash
    npm install
    npm run dev
    -open the shown localhost URL
# Features
    Labeled tiles for a subset of states (seed data)
    Status colors: white=NotStarted, pink=Partial, green=Complete
    Hover: pointer, slight scale-up, drop shadow
    Click: triggers UI callback; cycles status (NotStarted→Partial→Complete→NotStarted)
    Auto redraw on store updates
    Demo timers: CA→Complete (1s), TX→Partial (1.5s)
MVC split (Model/Store, Controller, View) → data/UI separation, easy to swap TopoJSON later
# Architecture (MVC)
    src/
    models/        # State.ts, StateStore.ts (pub/sub store)
    views/         # MapViewSquares.ts (Konva rendering)
    controllers/   # MapController.ts (wires view↔store), UIController.ts (navigation hook)
    main.ts        # bootstraps and mounts to <div id="map-container">
# Next (Stage 2 – Real Map)
    Replace MapViewSquares with MapViewTopo (TopoJSON + d3-geo + Konva.Path)
