// src/views/MapViewTopo.ts
/*=============================
  VIEW LAYER (MVC)
  Topo-based US map (Stage-2) rendered with Konva Paths.
  - Renders real state shapes from TopoJSON via d3-geo projection.
  - Hover: pointer + slight scale + shadow (drawn above neighbors only within canvas).
  - Color by StateStatus (white / pink / green).
  - Emits clicks via injected callback (controller -> UI bus).

  Related files:
    - Controller: src/controllers/MapController.ts
    - Model/Store: src/models/State.ts, src/models/StateStore.ts
    - ID mapping: src/maps/us-id-to-code.ts
==============================*/

import Konva from "konva";
import { feature } from "topojson-client";   // TopoJSON -> GeoJSON
import * as d3geo from "d3-geo";             // projection & path generator
import us from "us-atlas/states-10m.json";   // US TopoJSON data
import { usStateIdToCode } from "../data/maps/UsIdToCode"; // FIPS id -> "CA"
import { StateStatus, USState } from "../models/State";

type Topology = any;

// Ignore territory of U.S.
const TERRITORY_FIPS = new Set([60, 66, 69, 72, 78]);

export type MapViewTopoOptions = {
    containerId: string;                   // HTML container's id
    states: USState[];                     // store snapshot (code + status)
    onStateClick?: (s: USState) => void;   // click callback to controller/UI
};

// States -> fill color
function fillByStatus(s: StateStatus): string {
    if (s === StateStatus.Complete) return "#43A047";
    if (s === StateStatus.Partial)  return "#F8BBD0";
    return "#FFFFFF";                          
}


// topo main part: 
export default class MapViewTopo {
    private stage: Konva.Stage;
    private baseLayer: Konva.Layer;  // normal shape
    private hoverLayer: Konva.Layer;  // hover-only shapes (internal z-raise)
    private containerEl: HTMLElement;

    private geoFeatures: any[] = [];        // GeoJSON features
    private projection!: d3geo.GeoProjection;
    private geoPath!: d3geo.GeoPath<any, d3geo.GeoPermissibleObjects>;
    private byCode!: Map<string, USState>;
    private shapesByCode = new Map<string, Konva.Path>();      // for fast re-draw

    private ro!: ResizeObserver;  // responsive observer

    constructor(private opts: MapViewTopoOptions) {
        this.containerEl = document.getElementById(opts.containerId)!;

        // Init Konva stage sized to container (ResizeObserver keeps it in sync).        
        const { width, height } = this.getContainerSize();
        this.stage = new Konva.Stage({
            container: opts.containerId,
            width,
            height
        });
        this.baseLayer = new Konva.Layer();
        this.hoverLayer = new Konva.Layer();
        this.stage.add(this.baseLayer);
        this.stage.add(this.hoverLayer);

        this.prepareGeo();
        this.drawAll();

    // Responsive: recompute projection & redraw when container size changes.
    //  observe pattern
    this.ro = new ResizeObserver(() => this.resizeAndRedraw());
    this.ro.observe(this.containerEl);
    }

    // destroy(): Cleanup resources & listeners to prevent leaks 
    //      (disconnect ResizeObserver, destroy Stage).
    public destroy() {
        this.ro.disconnect();
        this.stage.destroy();
    }

    // redraw(states): Incremental redraw based on new state 
    //      (update fills only), no geometry/projection rebuild.
    public redraw(states: USState[]) {
        this.opts = { ...this.opts, states };
        this.byCode = new Map(states.map(s => [s.code, s]));
        this.drawAll(true);
    }


  // ---------- Internal implementation (class-private helpers) ----------

    // getContainerSize():
        // Read the container's current size (content box) and clamp to a safe minimum
        //  so the canvas never becomes 0 size. Used by projection fitting and stage sizing.
    private getContainerSize() {
        // Center the map within the container: Use CSS to control the outer layer of the container 
        // (like, enter with flex).
        const rect = this.containerEl.getBoundingClientRect();
        // set the min size to aviod 0.
        const width  = Math.max(320, Math.floor(rect.width));
        const height = Math.max(220, Math.floor(rect.height));
        return { width, height };
    }

    // prepareGeo():
        // Convert TopoJSON -> GeoJSON features, build code->state index, then init projection
    private prepareGeo() {
        // Topo to Geo
        const topo: Topology = us as any;
        const fc: any = feature(topo, topo.objects.states); // Feature Collection
        this.geoFeatures = fc.features;

        // init projection.
        this.byCode = new Map(this.opts.states.map(s => [s.code, s]));
        this.updateProjection();
    }

    // updateProjection():
        // Recompute AlbersUSA projection to fit current container size,
        // refresh geoPath and sync Konva stage size.
    private updateProjection() {
        const { width, height } = this.getContainerSize();
        // AlbersUSA + fitSize
        this.projection = d3geo.geoAlbersUsa().fitSize([width, height], {
        type: "FeatureCollection",
        features: this.geoFeatures
        } as any);

        this.geoPath = d3geo.geoPath(this.projection);
        //sync Konva size
        this.stage.size({ width, height });
    }

    // drawAll();
        // Render all or incrementally update fills.
        // - Full draw (isRedraw=false): rebuild all paths and interactions.
        // - Incremental (isRedraw=true): update fill colors only.
    private drawAll(isRedraw = false) {
        //First/Full
        if (!isRedraw) {
            this.baseLayer.destroyChildren();
            this.hoverLayer.destroyChildren();
            this.shapesByCode.clear();
        } else {
        // Only updates the fill
            this.byCode.forEach((state, code) => {
                const shape = this.shapesByCode.get(code);
                if (shape) {
                    //states status color
                    shape.fill(fillByStatus(state.status));
                }
            });

            this.baseLayer.batchDraw();
            return;
        }

        const byCode = this.byCode;

        this.geoFeatures.forEach((f: any) => {
            // Compatible with different data sources: 
            //  like some data of CA is "06" (string "06"). not "6"
            const idRaw = (f as any).id ?? (f as any).properties?.STATEFP;
            const fips = Number(idRaw);
            if (TERRITORY_FIPS.has(fips)) {
                console.info("[map] skip territory FIPS:", fips);
                return;
            }

            const code = usStateIdToCode(Number(idRaw));
            if (!code) {
                console.warn("[map] unknown FIPS id:", idRaw, f);
                return;
            }

            const s = byCode.get(code);
            const stateToDraw = s ?? { code, name: code, status: StateStatus.NotStarted };

            const pathData = this.geoPath(f);
            if (!pathData) {
                console.warn("[map] null path for code:", code, f);
                return;
            }

            const shape = new Konva.Path({
                data: pathData,
                fill: fillByStatus(stateToDraw.status),
                stroke: "#9E9E9E",
                strokeWidth: 1,
                shadowEnabled: true,
                shadowBlur: 0,
                shadowOpacity: 0
            });

/*             const code = usStateIdToCode(f.id);  //fips -> "CA"
            const s = byCode.get(code);
            // Check States not included in the question bank, can be skipped for now
            if (!s) return;

            const pathData = this.geoPath(f); // Generate SVG path string
            if (!pathData) return;

            // Set the States stroke and initial fill color
            const shape = new Konva.Path({
                data: pathData,
                fill: fillByStatus(s.status),  //fill states status color
                stroke: "#9E9E9E",
                strokeWidth: 1,
                shadowEnabled: true,
                shadowBlur: 0,
                shadowOpacity: 0
            }); */


            // States' shape reaction: Mouse (internal z-raise, won't cover external DOM UI)
            shape.on("mouseenter", () => {
                this.stage.container().style.cursor = "pointer";

                // Temporarily move the shape to hoverLayer 
                // (only raises the layer inside the map, without covering the external DOM UI).
                shape.moveTo(this.hoverLayer);

                shape.to({ scaleX: 1.02, scaleY: 1.02, duration: 0.06 });
                shape.to({ shadowBlur: 10, shadowOpacity: 0.25, duration: 0.06 });
                this.hoverLayer.batchDraw();
            });

            shape.on("mouseleave", () => {
                this.stage.container().style.cursor = "default";

                // move it back.
                shape.moveTo(this.baseLayer);

                shape.to({ scaleX: 1, scaleY: 1, duration: 0.06 });
                shape.to({ shadowBlur: 0, shadowOpacity: 0, duration: 0.06 });
                this.baseLayer.batchDraw();
            });

            // Mouse click event here:  Click -> delegate to controller/UI
            shape.on("click", () => {
                const current = this.byCode.get(code) 
                    ?? { code, name: code, status: StateStatus.NotStarted };
                this.opts.onStateClick?.(current);
            });
            this.baseLayer.add(shape);
            this.shapesByCode.set(code, shape); // for Incremental redraw, code to path. 
        });

        this.baseLayer.draw();
    }

    // resizeAndRedraw():
    // the container size changes (triggered by ResizeObserver):
    private resizeAndRedraw() {
        this.updateProjection(); //Reproject the AlbersUSA image using the current container's width and height
        this.drawAll(false);
    }
}