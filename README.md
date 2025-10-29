# Lab2
Fresh repository with main branch.

# Quick Start
    ```bash
    npm install
    npm run dev
    -(open the shown localhost URL)

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
