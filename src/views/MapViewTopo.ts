// src/views/MapViewTopo.ts
/*==============================================================================
MapViewTopo — View Layer (MVC)

Public API
- constructor(opts: { containerId, states, onStateClick? })
- destroy()
- redraw(states: USState[])
- getStage()
- getLayer()               // returns mapLayer (backward compat)
- setInteractive(on: boolean)  // toggles map & label interactions


Layers & Groups
- mapLayer (Konva.Layer, listening: true)
  * State shapes as Konva.Path (cached in shapesByCode)
- labelsLayer (Konva.Layer, listening: true)
  * In-map abbreviations (Konva.Text, listening: false)
  * Tiny-state chips (Group name="ext-label": hit Rect + Rect + Text) + leader Line
- uiLayer (Konva.Layer, listening: false, always on top)
  * tooltipGroup (Rect bg + Text) — display only, events pass through

Feature Categories
A) State shapes: Path(data from d3-geo), fillByStatus, hitStrokeWidth for stable hover.
B) Events: mouseenter/move/leave/click on shapes & chips; no moveToTop; forwardStateClick(code).
C) Tiny states (right column): chips + leader lines; tracked in chipsByCode.

Design Notes
- Tooltip lives in uiLayer (topmost, non-interactive).
- setInteractive() affects mapLayer & labelsLayer only (uiLayer stays passive).
- Layers reduced from 4 → 3 for simpler z-ordering and better perf.

Related
- Controller: src/controllers/MapController.ts
- Model/Store: src/models/State.ts, src/models/StateStore.ts
- Maps: src/data/maps/UsIdToCode.ts, src/data/maps/UsCodeToName.ts

Historyy
- update : add mountains and rivers view.
- Sprint 2: merged base/abbrev/external into mapLayer + labelsLayer; moved tooltip to uiLayer.
- Sprint 1: switched from square tiles to real TopoJSON shapes.
==============================================================================*/


import Konva from "konva";
import { feature,mesh } from "topojson-client";   // TopoJSON -> GeoJSON
import * as d3geo from "d3-geo";             // projection & path generator

import us from "us-atlas/states-10m.json";   // US TopoJSON data
import countriesTopo from "world-atlas/countries-50m.json"; // Canada and Mexico data

import { usStateIdToCode } from "../data/maps/UsIdToCode"; // FIPS id -> "CA"
import { StateStatus, USState } from "../models/State";
import { codeToFullName, TINY_STATES } from "../data/maps/UsCodeToName";

// sprint 2: 
// The state's geographical features :rivers and mountains.
import rivers from "../data/maps/rivers.json";
import mountains from "../data/maps/mountains.json";


type Topology = any;

// Ignore territory of U.S.
const TERRITORY_FIPS = new Set([60, 66, 69, 72, 78]);

// Move to theme/constants later ========================================
// Sprint 2 Typography for labels and tooltip
const LABEL_FONT_FAMILY = "system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif";
const LABEL_FONT_SIZE = 12;      // in-map abbreviations
const TOOLTIP_FONT_SIZE = 14;    // floating full name
const LABEL_FILL = "#010102ff";
const TOOLTIP_BG = "rgba(0,0,0,0.75)";
const TOOLTIP_TEXT = "#f3e8e8ff";

// Tiny-state chip (external label) styles
const CHIP_PAD_X = 8;
const CHIP_PAD_Y = 4;
const CHIP_RADIUS = 6;
const CHIP_STROKE = "#8aa0b3";
const CHIP_ROW = 26;

//  Mouse hover High light
const HOVER_STROKE = "#004bfaff";
const HOVER_STROKE_WIDTH = 2;

// Fixed Spasming issue: make hit region wider to stabilize hover on small shapes
const HIT_STROKE_WIDTH = 20;

// Map padding & right gutter for tiny-state label column
const MAP_MARGIN_LEFT = 16;
const MAP_MARGIN_RIGHT_GUTTER = 140;  // or 180, 200 set right side space for tiny states label
// const MAP_MARGIN_TOP = 0;
// const MAP_MARGIN_BOTTOM = 16; 

// mountinas style (arrow) :
const ARROW_COLOR = '#b89775ff';
const ARROW_STROKE_WIDTH = 3;
const ARROW_LEN_PX = 1;        // arrow body, min >= 1 
const ARROW_SPACING_PX = 15;    // peak distance
const ARROW_HEAD_LEN = 8;       // peak high
const ARROW_HEAD_WIDTH = 5;     // peak width
const ARROW_OPACITY = 0.7;

// Neighbors & water labels styling
const WATER_LABEL_FONT_SCALE = 0.016; // stage.width * scale
const WATER_LABEL_FILL = "#607d8b";
const WATER_LABEL_OPACITY = 0.35;
const ATLANTIC_AVOID_TINY = true; 
const TINY_MARGIN = 20;    


// sprint 2: US neighbor 
// Canada / Mexico outline. Layer: maylayer
const NEIGHBOR_FILL = "#d3d3d3ff";
const NEIGHBOR_FILL_OPACITY = 1;
const NEIGHBOR_STROKE = "#8aa0b3";
const NEIGHBOR_STROKE_WIDTH = 0.8;
    // Shared border with US
const BORDER_STROKE = "#8b6070ff";
const BORDER_STROKE_WIDTH = 2;


// AK/HI BG
const AKHI_RECT_FILL = "#8fe9fdff";
const AKHI_RECT_STROKE = "#b1b1b1ff";
const AKHI_RECT_STROKE_WIDTH = 1;   
const AKHI_RECT_PAD = 6;
const AKHI_RECT_RADIUS = 2;    

// ================================================================================

export type MapViewTopoOptions = {
    containerId: string;                   // HTML container's id
    states: USState[];                     // store snapshot (code + status)
    onStateClick?: (s: USState) => void;   // click callback to controller/UI
};

// States -> fill color
function fillByStatus(s: StateStatus): string {
    if (s === StateStatus.Complete) return "#81C784";
    if (s === StateStatus.Partial)  return "#E57373";
    return "#FAF0E6";     
}
// mountina helper 1: pick pot follow the data.json line
function samplePolylineBySpacing(
    pts: { x: number; y: number }[], spacing: number): { x: number; y: number }[] {
        if (pts.length < 2) return pts.slice();
        const out: { x: number; y: number }[] = [];
        out.push({ ...pts[0] });
        let acc = 0;
        for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i];
            const dx = b.x - a.x, dy = b.y - a.y;
            let seg = Math.hypot(dx, dy);
            if (seg === 0) continue;

            while (acc + seg >= spacing) {
                const t = (spacing - acc) / seg;           // [0,1]
                out.push({ x: a.x + dx * t, y: a.y + dy * t });
                // update line points form topo data
                const nx = a.x + dx * t, ny = a.y + dy * t;
                const ndx = b.x - nx, ndy = b.y - ny;
                seg = Math.hypot(ndx, ndy);
                acc = 0;
                // put the current point as the new start:
                (a.x = nx), (a.y = ny);
            }
            acc += seg;
        }

    // confirm the end pot is in the line.
    const last = pts[pts.length - 1];
    const lastOut = out[out.length - 1];
    if (!lastOut || lastOut.x !== last.x || lastOut.y !== last.y) out.push({ ...last });
    return out;
}
// mountina helper 2: arrow shape as peak
function createUpArrowTemplate(): Konva.Arrow {
    const arrow = new Konva.Arrow({
        points: [0, ARROW_LEN_PX, 0, 0],
        stroke: ARROW_COLOR,
        strokeWidth: ARROW_STROKE_WIDTH,
        fill: ARROW_COLOR,           
        pointerLength: ARROW_HEAD_LEN,
        pointerWidth: ARROW_HEAD_WIDTH,
        pointerAtBeginning: false, 
        listening: false,
        shadowForStrokeEnabled: true,
        opacity:ARROW_OPACITY,

        //The canvas blur filter wastes cost too much.
        /*
        shadowColor: ARROW_SHADOW,
        shadowOpacity: 0.5,
        shadowBlur: 2,
        */
        perfectDrawEnabled: false,
    });

    // static save resouce
    arrow.cache();
    return arrow;
}

// Sprint 1 topo main part: Main default class of the map view:
export default class MapViewTopo {
    private stage: Konva.Stage;
    private mapLayer: Konva.Layer;     // State Shapes (Coloring)
    private containerEl: HTMLElement;

    // sprint2:  
    private labelsLayer: Konva.Layer;   //State abbreviations "CA" + tiny states on the right
    private uiLayer: Konva.Layer;               // floating tooltip

    // sprint2:  
    private tooltipGroup!: Konva.Group;
    private tooltipBg!: Konva.Rect;
    private tooltipText!: Konva.Text;

    private geoFeatures: any[] = [];        // GeoJSON features
    private projection!: d3geo.GeoProjection;
    private geoPath!: d3geo.GeoPath<any, d3geo.GeoPermissibleObjects>;
    private byCode!: Map<string, USState>;
    private shapesByCode = new Map<string, Konva.Path>();      // for fast re-draw

    // Tiny states Label event:
    private chipsByCode = new Map<string, { group: Konva.Group; rect: Konva.Rect }>();
    private ro!: ResizeObserver;  // responsive observer

    // sprint 2: 
    // state's geographical features mountains and rivers.
    private terrainGroup?: Konva.Group;
    private rangesGroup?: Konva.Group;
    private riversGroup?: Konva.Group;
    private riverAnim?: Konva.Animation;
    private riverLines: Konva.Line[] = [];

    // AK/HI BG
    private akhiUnderlayGroup?: Konva.Group;

    constructor(private opts: MapViewTopoOptions) {
        this.containerEl = document.getElementById(opts.containerId)!;
        // Init Konva stage sized to container (ResizeObserver keeps it in sync).        
        const size = this.getContainerSize();
        this.stage = new Konva.Stage({
            container: opts.containerId,
            width: size.width,
            height: size.height
        });

        this.mapLayer = new Konva.Layer();
        this.labelsLayer = new Konva.Layer();
        this.uiLayer = new Konva.Layer({ listening: false }); 

        //sprint2
        this.stage.add(this.mapLayer);
        this.stage.add(this.labelsLayer);
        this.stage.add(this.uiLayer);
        this.uiLayer.moveToTop();
        
        //sprint2
        this.tooltipGroup = new Konva.Group({ visible: false, listening: false });
        this.tooltipBg = new Konva.Rect({ fill: TOOLTIP_BG, cornerRadius: 6 });
        this.tooltipText = new Konva.Text({
            fontFamily: LABEL_FONT_FAMILY,
            fontSize: TOOLTIP_FONT_SIZE,
            fill: TOOLTIP_TEXT,
            padding: 6,
        });
        this.tooltipGroup.add(this.tooltipBg, this.tooltipText);
        this.uiLayer.add(this.tooltipGroup);

        this.prepareGeo();
        // Use the same measured size to init projection
        this.updateProjection(size);

        this.drawAll();

        this.ro = new ResizeObserver(() => this.resizeAndRedraw());
        this.ro.observe(this.containerEl);
    }

    // destroy(): Cleanup resources & listeners to prevent leaks 
    //      (disconnect ResizeObserver, destroy Stage).
    public destroy() {
        this.ro.disconnect();
        this.stage.destroy();
        this.riverAnim?.stop();
        this.riverAnim = undefined;
    }

    // redraw(states): Incremental redraw based on new state 
    //      (update fills only), no geometry/projection rebuild.
    public redraw(states: USState[]) {
        this.opts = { ...this.opts, states };
        this.byCode = new Map(states.map(s => [s.code, s]));
        this.drawAll(true);
    }


  // ---------- Internal implementation helpers ----------
    // getContainerSize():
    // Read the container's current size (content box) and clamp to a safe minimum.
    private getContainerSize() {
        const el = this.containerEl;
        const width  = Math.max(320, Math.floor(el.clientWidth  || 0));
        const height = Math.max(220, Math.floor(el.clientHeight || 0));
        return { width, height };
    }

    // prepareGeo(): TopoJSON -> GeoJSON, build code->state index, init projection
    private prepareGeo() {
        const topo: Topology = us as any;
        const fc: any = feature(topo, topo.objects.states); // Feature Collection
        this.geoFeatures = fc.features;

        this.byCode = new Map(this.opts.states.map(s => [s.code, s]));
        this.updateProjection();
    }

    // updateProjection(): fit projection to current container size.
    private updateProjection(size?: { width: number; height: number }) {
        const { width, height } = size ?? this.getContainerSize();
        
        //new: Leave some space for the right tiny states label side
        // Calculate the actual rectangular area the map will occupy:
        // Horizontal: From MAP_MARGIN_LEFT to (width - MAP_MARGIN_RIGHT_GUTTER)
        // Top and bottom: Leave some top and bottom margins
        const left = MAP_MARGIN_LEFT;
        const right = Math.max(left + 100, width - MAP_MARGIN_RIGHT_GUTTER); // avoide the stage being too small
        const top = 0;
        const bottom = height;

        this.projection = d3geo.geoAlbersUsa().fitExtent(
            [[left, top], [right, bottom]],
            {
                type: "FeatureCollection",
                features: this.geoFeatures
            } as any
        );

        this.geoPath = d3geo.geoPath(this.projection);
    }

    // mountina line Project [[lon,lat],...] as [x1,y1,x2,y2,...] for Konva.Line
    private projectPoints(coords: number[][]): number[] {
        const pts: number[] = [];
        for (const [lon, lat] of coords) {
            const p = this.projection([lon, lat]) as [number, number];
            if (p) { pts.push(p[0], p[1]); }
        }
        return pts;
    } 

    // draw mountains in maplayer group: Topo line version — draw ridge lines from mountains.json
    private drawMountains() {
        if (!this.rangesGroup) return;
        this.rangesGroup.destroyChildren();

        // 1 form mountains.jsonp pick GeoJSON features（Topology / FeatureCollection）
        const src: any = mountains as any;
        const features: any[] =
            src?.type === "Topology"
            ? (feature(src, src.objects?.mountains) as any).features
            : (src?.features || []);

        const arrowTpl = createUpArrowTemplate(); // peak shape

        // 2 visit each point on mountna line:
        for (const f of features) {
            const g = f?.geometry;
            if (!g) continue;

            // LineString / MultiLineString
            const lines: number[][][] =
                g.type === "LineString" ? [g.coordinates]
                : g.type === "MultiLineString" ? g.coordinates
                : [];

            for (const line of lines) {
                // Projected as screen points (object form, for easy sampling).
                const ptsObj = line
                    .map(([lon, lat]) => {
                        const p = this.projection([lon, lat]) as [number, number] | null;
                        return p ? { x: p[0], y: p[1] } : null;
                    })
                    .filter(Boolean) as { x: number; y: number }[];

                if (ptsObj.length < 2) continue;

                // peaks coordinates
                const samples = samplePolylineBySpacing(ptsObj, ARROW_SPACING_PX);

                // // Stamp: Clone the template and place (x,y) at the sampling point;
                for (const s of samples) {
                    const a = arrowTpl.clone({ x: s.x, y: s.y });
                    this.rangesGroup!.add(a);
                }
            }
        }
    }

    // Drawing the river: dashed lines + dashOffset 
    // to create a "flowing" effect; unified animation drive.
    private drawRivers() {
        if (!this.riversGroup) return;

        this.riverLines.length = 0; // clear last references

        const fc = (rivers as any).features || [];
        for (const f of fc) {
            const geom = f.geometry;
            const lines: number[][][] =
            geom.type === "LineString" ? [geom.coordinates] : geom.coordinates;

            for (const line of lines) {
                const pts = this.projectPoints(line);
                const river = new Konva.Line({
                    points: pts,
                    stroke: "#3c91cfff",        // river color
                    opacity: 0.7,
                    strokeWidth: 1.5,
                    dash: [10, 4],            // dash line
                    listening: false,         // event off
                    hitStrokeWidth: 0,
                    shadowForStrokeEnabled: false,
                    perfectDrawEnabled: false,
                    globalCompositeOperation: "multiply", // rivers color blend naturally
                });

                this.riversGroup.add(river);
                this.riverLines.push(river);
            }
        }
    }

    // river animation: advancing frame by frame dashOffset
    private startRiverFlow(forceRestart = false) {
        if (this.riverAnim && forceRestart) {
            this.riverAnim.stop();
            this.riverAnim = undefined;
        }
        if (this.riverAnim) return;
        let t = 0;
        this.riverAnim = new Konva.Animation(() => {
            t = (t + 0.2) % 1e4;         // river speed：0.1~1.0
            for (const l of this.riverLines) l.dashOffset(-t);
            this.mapLayer.batchDraw();       // redraw same layer at once.
        }, this.mapLayer);

        this.riverAnim.start();
    }

    // Group building terrain with one layer(maplayer)
    private buildTerrain() {
        this.riverAnim?.stop();
        this.riverAnim = undefined;
        // after destroyChildren，redraw
        if (!this.terrainGroup) {
            this.terrainGroup = new Konva.Group({ name: "terrain", listening: false });
            this.rangesGroup  = new Konva.Group({ name: "ranges",  listening: false });
            this.riversGroup  = new Konva.Group({ name: "rivers",  listening: false });
            this.terrainGroup.add(this.rangesGroup, this.riversGroup);
            this.mapLayer.add(this.terrainGroup);       // In one layer
        } else {
            // all rebuild
            this.rangesGroup?.destroyChildren();
            this.riversGroup?.destroyChildren();
            this.riverLines.length = 0;
        }

        this.drawMountains();
        this.drawRivers();
        this.startRiverFlow(true);
        this.mapLayer.batchDraw();
    }

    // Neighbor Countries and Border : maplayer
    private drawNeighborCountriesAndBorders() {
        const countriesFC: any = feature(
            countriesTopo as any, 
            (countriesTopo as any).objects.countries
        );

        // ISO 3166-1 numeric ids in world-atlas
        // be careful if atlas var isnt numeric.
        const ID_USA = '840', ID_CAN = '124', ID_MEX = '484';

        const neighbors = countriesFC.features.filter(
            (f: any) => f.id === ID_CAN || f.id === ID_MEX
        );

        for (const f of neighbors) {
            const pathData = this.geoPath(f);
            if (!pathData) {
                continue;
            }
            const shape = new Konva.Path({
                data: pathData,
                fill: NEIGHBOR_FILL,
                opacity: NEIGHBOR_FILL_OPACITY,
                stroke: NEIGHBOR_STROKE,
                strokeWidth: NEIGHBOR_STROKE_WIDTH,
                listening: false,
                perfectDrawEnabled: false,
                hitStrokeWidth: 0,
                globalCompositeOperation: "source-over",
            });
            
            this.mapLayer.add(shape);
            shape.moveToBottom();
        }

        // Countries Border 
        const borderGeom = mesh(
            countriesTopo as any,
            (countriesTopo as any).objects.countries,
            // Canada & US, and Mex & US
            (a: any, b: any) =>
            (a.id === ID_USA && (b.id === ID_CAN || b.id === ID_MEX)) ||
            (b.id === ID_USA && (a.id === ID_CAN || a.id === ID_MEX))
        );

        // Border line over the neighbor shape
        const borderPath = this.geoPath({ type: "Feature", geometry: borderGeom } as any);
        if (borderPath) {
            const kline = new Konva.Path({
                data: borderPath,
                stroke: BORDER_STROKE,
                strokeWidth: BORDER_STROKE_WIDTH,
                listening: false,
                perfectDrawEnabled: false,
                hitStrokeWidth: 0,
                name: "neighbor-border"
            });
            this.mapLayer.add(kline);
            kline.moveToTop();
        }
    }

    // neighbor label name
    private placeNeighborLabels() {
        const anchors = [
            { name: "CANADA", refLon: -100, refLat: 49.0, dx: 0, dy: -Math.max(24, this.stage.height() * 0.04) },
            { name: "MEXICO", refLon: -104, refLat: 29.5, dx: 0, dy:  Math.max(24, this.stage.height() * 0.04) },
        ];

        for (const a of anchors) {
            const p = this.projection([a.refLon, a.refLat]) as [number, number] | null;
            if (!p) continue;
            const x = p[0] + a.dx;
            const y = p[1] + a.dy;

            const t = new Konva.Text({
                x, y, text: a.name,
                fontFamily: LABEL_FONT_FAMILY,
                fontSize: Math.round(this.stage.width() * 0.015),
                fill: "#6c6b6bff",
                opacity: 0.35,
                listening: false,
            });
            t.offsetX(t.width() / 2);
            t.offsetY(t.height() / 2);

            // move the mexico pos to top of the HI state BG.
            if (a.name === "MEXICO") {
                const hiShape = this.shapesByCode.get("HI");
                if (hiShape) {
                    const hi = hiShape.getClientRect();
                    const pad = Math.max(8, Math.round(this.stage.height() * 0.02));
                    const centerX = hi.x + hi.width / 2;
                    const aboveY  = hi.y - pad - t.height() / 2;
                    t.position({ x: centerX, y: aboveY });
                } else {
                    t.x(t.x() - 60);
                    t.y(t.y() - 40);
                }
            }
            this.labelsLayer.add(t);
        }
        this.labelsLayer.batchDraw();
    }

    // Place water body labels (Pacific / Atlantic / Gulf of Mexico) on labelsLayer.
    // Auto sizes with stage and projection.
    private placeOceanLabels() {
        this.labelsLayer.find(".water-label").forEach(n => n.destroy());

        // vertical needed check
        const anchors = [
            { key: "PACIFIC",  text: "PACIFIC OCEAN",  lon: -130, lat: 37,  vertical: true  },
            { key: "ATLANTIC", text: "ATLANTIC OCEAN", lon:  -70, lat: 35,  vertical: false  },
            { key: "GULF",     text: "GULF OF MEXICO", lon:  -90, lat: 26,  vertical: false },
        ];

        const fontSize = Math.round(this.stage.width() * WATER_LABEL_FONT_SCALE);
        const MARGIN = Math.max(8, Math.round(this.stage.width() * 0.01));

        // label avoid tiny gourp
        let tinyTop = Infinity, tinyBottom = -Infinity;
        const tinyGroups = this.labelsLayer.find(".ext-label");

        tinyGroups.forEach((g) => {
            const r = (g as Konva.Node).getClientRect({ relativeTo: this.labelsLayer });
            tinyTop = Math.min(tinyTop, r.y);
            tinyBottom = Math.max(tinyBottom, r.y + r.height);
        });
        const hasTinyColumn = tinyGroups.length > 0;

        for (const a of anchors) {
            const p = this.projection([a.lon, a.lat]) as [number, number] | null;
            if (!p) continue;

            let x = p[0];
            let y = p[1];

            // right tiny label avoid
            if (ATLANTIC_AVOID_TINY && a.key === "ATLANTIC" && hasTinyColumn) {
                const nearRight = x > this.stage.width() - 200;
                if (nearRight) y = Math.max(y, tinyBottom + TINY_MARGIN);
            }

            const t = new Konva.Text({
                x, y,
                text: a.text,
                name: "water-label",
                fontFamily: LABEL_FONT_FAMILY,
                fontSize,
                fill: WATER_LABEL_FILL,
                opacity: WATER_LABEL_OPACITY,
                listening: false,
                align: "center",
                perfectDrawEnabled: false,
            });

            // Rotation point with the center
            t.offsetX(t.width() / 2);
            t.offsetY(t.height() / 2);
            if (a.vertical) t.rotation(-90);

            // boundary clamping to prevent it from being clipped by the stage
            let rect = t.getClientRect({ relativeTo: this.labelsLayer });
            let dx = 0, dy = 0;
            if (rect.x < MARGIN) dx = MARGIN - rect.x;
            if (rect.y < MARGIN) dy = MARGIN - rect.y;
            if (rect.x + rect.width > this.stage.width() - MARGIN)
            dx = (this.stage.width() - MARGIN) - (rect.x + rect.width);
            if (rect.y + rect.height > this.stage.height() - MARGIN)
            dy = (this.stage.height() - MARGIN) - (rect.y + rect.height);

            if (dx !== 0 || dy !== 0) {
                t.x(t.x() + dx);
                t.y(t.y() + dy);
            }
            this.labelsLayer.add(t);
        }
        this.labelsLayer.batchDraw();
    }

    // Sprint 2 Tooltip helpers ===================================
    private showTooltip(text: string, clientX: number, clientY: number) {
        this.tooltipText.text(text);
        this.tooltipBg.width(this.tooltipText.width() + 12);
        this.tooltipBg.height(this.tooltipText.height() + 12);

        const { x, y } = this.toStagePos(clientX, clientY);
        this.tooltipGroup.position({ x: x + 12, y: y + 12 });
        this.uiLayer.moveToTop();  // keep on the top
        this.tooltipGroup.moveToTop();
        this.tooltipGroup.visible(true);
        this.uiLayer.batchDraw();
    }

    private positionTooltip(clientX: number, clientY: number) {
        if (!this.tooltipGroup.visible()) return;
        const { x, y } = this.toStagePos(clientX, clientY);
        this.tooltipGroup.position({ x: x + 12, y: y + 12 });
        this.uiLayer.batchDraw();
    }

    private hideTooltip() {
        this.tooltipGroup.visible(false);
        this.uiLayer.batchDraw();
    }

    // Convert browser client coords → Konva stage coords
    private toStagePos(clientX: number, clientY: number) {
        const rect = this.stage.container().getBoundingClientRect();
        const scale = this.stage.scale() || { x: 1, y: 1 };
        return {
            x: (clientX - rect.left) / scale.x,
            y: (clientY - rect.top) / scale.y,
        };
    }

    // Cal the label group base Y (vertical centering)
    private getTinyBaseY(count: number): number {
        const total = count * CHIP_ROW;
        const h = this.stage.height();
        return Math.max(12, Math.floor((h - total) / 2));
    }

    // ---- centralize state lookup & forwarding ----
    private getStateFor(code: string): USState {
        return this.byCode.get(code) ?? { code, name: code, status: StateStatus.NotStarted };
    }

    private forwardStateClick(code: string) {
        const s = this.getStateFor(code);
        this.opts.onStateClick?.(s);
    }

    // An external label with a leader polyline to the state's centroid
    private addExternalLabelForTinyState(
        code: string,
        fullName: string,
        stateCenter: [number, number],
        orderIndex?: number,
        baseY: number = 40
    ) {
        const index = orderIndex ?? this.labelsLayer.find(".ext-label").length;

        // Right boundary & row Y
        const right = this.stage.width() - 12;
        const y = baseY + index * CHIP_ROW;

        // Measure text once to size the chip
        const text = new Konva.Text({
            text: `${code} — ${fullName}`,
            fontFamily: LABEL_FONT_FAMILY,
            fontSize: LABEL_FONT_SIZE,
            fill: LABEL_FILL,
            listening: false,
        });
        const chipW = Math.ceil(text.width() + 2 * CHIP_PAD_X);
        const chipH = Math.ceil(text.height() + 2 * CHIP_PAD_Y);

        const rect = new Konva.Rect({
            width: chipW,
            height: chipH,
            cornerRadius: CHIP_RADIUS,
            fill: fillByStatus(this.getStateFor(code).status), // Coloring starts from the initial state
            stroke: CHIP_STROKE,
            strokeWidth: 1,
        });
        text.position({ x: CHIP_PAD_X, y: CHIP_PAD_Y });

        // Hit-rect to enlarge clickable area
        const group = new Konva.Group({
            x: right - chipW, // right aligned
            y,
            name: "ext-label",
            listening: true,
        });
        const hit = new Konva.Rect({
            x: -4,
            y: -4,
            width: chipW + 8,
            height: chipH + 8,
            fill: "rgba(0,0,0,0.001)",
            listening: true,
        });

        group.add(hit, rect, text);

        // Leader line: to the left edge of the chip
        const [cx, cy] = stateCenter;
        const leftEdge = right - chipW;
        const ty = y + chipH / 2;
        const midX = leftEdge - 12;
        const line = new Konva.Line({
            points: [cx, cy, midX, ty, leftEdge, ty],
            stroke: "#8aa0b3",
            strokeWidth: 1,
            listening: true,
        });

        // Chip interactions (no tooltip here)
        group.on("mouseenter", () => {
            this.stage.container().style.cursor = "pointer";
            rect.stroke(HOVER_STROKE);
            rect.strokeWidth(2);

            const shape = this.shapesByCode.get(code);
            if (shape) {
                shape.stroke(HOVER_STROKE);
                shape.strokeWidth(HOVER_STROKE_WIDTH);
                shape.getLayer()?.batchDraw();
            }
            this.labelsLayer.batchDraw();
        });

        group.on("mouseleave", () => {
            this.stage.container().style.cursor = "default";
            rect.stroke(CHIP_STROKE);
            rect.strokeWidth(1);

            const shape = this.shapesByCode.get(code);
            if (shape) {
                shape.stroke("#9E9E9E");
                shape.strokeWidth(1);
                shape.getLayer()?.batchDraw();
            }
            this.hideTooltip(); // Avoid: bringing state shapes with parameter tooltips
            this.labelsLayer.batchDraw();
        });

        const onClick = () => this.forwardStateClick(code);
        group.on("click", onClick);
        line.on("click", onClick);

        this.labelsLayer.add(line);
        this.labelsLayer.add(group);

        this.chipsByCode.set(code, { group, rect });
    }

    // resizeAndRedraw():
    private resizeAndRedraw() {
        const size = this.getContainerSize();

        const sw = this.stage.width();
        const sh = this.stage.height();
        if (size.width === sw && size.height === sh) return;

        this.stage.size({ width: size.width, height: size.height });
        this.updateProjection(size);
        this.drawAll(false);
    }

    // =======Main ========  drawAll():
    // - Full draw (isRedraw=false): rebuild everything.
    // - Incremental (isRedraw=true): only update fills.
    private drawAll(isRedraw = false) {
        if (!isRedraw) {
            this.mapLayer.destroyChildren();
            this.labelsLayer.destroyChildren();
            
            this.shapesByCode.clear();
            this.chipsByCode.clear(); 
            
            this.terrainGroup = undefined;
            this.rangesGroup  = undefined;
            this.riversGroup  = undefined;

            // AK / HI white BG
            this.akhiUnderlayGroup = new Konva.Group({ name: "akhi-rect-underlay", listening: false });
            this.mapLayer.add(this.akhiUnderlayGroup);

        } else {
            // Update fills only
            this.byCode.forEach((state, code) => {
                //US States shapes
                const shape = this.shapesByCode.get(code);
                if (shape) shape.fill(fillByStatus(state.status));

                // tiny States shapes
                const chip = this.chipsByCode.get(code);
                if (chip) chip.rect.fill(fillByStatus(state.status));
            });
            
            this.buildTerrain(); // river and mountina
            this.placeOceanLabels(); 
            this.riversGroup?.moveToTop();
            this.mapLayer.batchDraw();
            this.labelsLayer.batchDraw();
            return;
        }

        const byCode = this.byCode;

        // Tiny-state labeling strategy (collect first, then render right column)
        const tinyQueue: Array<{ code: string; full: string; center: [number, number] }> = [];

        this.geoFeatures.forEach((f: any) => {
            const idRaw = (f as any).id ?? (f as any).properties?.STATEFP;
            const fips = Number(idRaw);
            if (TERRITORY_FIPS.has(fips)) return;

            const code = usStateIdToCode(Number(idRaw));
            if (!code) return;

            const s = byCode.get(code);
            const stateToDraw = s ?? { code, name: code, status: StateStatus.NotStarted };

            const pathData = this.geoPath(f);
            if (!pathData) return;

            // get top x and y form AK & HI 
            if (code === "AK" || code === "HI") {
                const [[x0, y0], [x1, y1]] = this.geoPath.bounds(f) as [[number, number], [number, number]];
                const rect = new Konva.Rect({
                    x: Math.floor(x0 - AKHI_RECT_PAD),
                    y: Math.floor(y0 - AKHI_RECT_PAD),
                    width: Math.ceil((x1 - x0) + 2 * AKHI_RECT_PAD),
                    height: Math.ceil((y1 - y0) + 2 * AKHI_RECT_PAD),
                    cornerRadius: AKHI_RECT_RADIUS,
                    fill: AKHI_RECT_FILL,
                    stroke: AKHI_RECT_STROKE,
                    strokeWidth: AKHI_RECT_STROKE_WIDTH,
                    listening: false,
                    perfectDrawEnabled: false,
                });
                this.akhiUnderlayGroup!.add(rect);
            }

            const shape = new Konva.Path({
                data: pathData,
                fill: fillByStatus(stateToDraw.status),
                stroke: "#9E9E9E",
                strokeWidth: 1,
                hitStrokeWidth: HIT_STROKE_WIDTH,
                shadowEnabled: false
            });
            this.mapLayer.add(shape);
            this.shapesByCode.set(code, shape);

            // label or collect tiny
            const [cx, cy] = this.geoPath.centroid(f) as [number, number];
            
            if (!TINY_STATES.has(code as any)) {
                const abbrev = new Konva.Text({
                    x: cx, y: cy, text: code,
                    fontFamily: LABEL_FONT_FAMILY,
                    fontSize: LABEL_FONT_SIZE,
                    fill: LABEL_FILL,
                    listening: false
                });
                abbrev.offsetX(abbrev.width() / 2);
                abbrev.offsetY(abbrev.height() / 2);

                // sprint2 new State abbreviations and centroid(pending)
                this.labelsLayer.add(abbrev);

            } else {
                tinyQueue.push({ code, full: codeToFullName(code), center: [cx, cy] });
            }

            // States' mouse events
            shape.on("mouseenter", (evt) => {
                this.stage.container().style.cursor = "pointer";
                shape.stroke(HOVER_STROKE);
                shape.strokeWidth(HOVER_STROKE_WIDTH);
                this.mapLayer.batchDraw(); 
                this.showTooltip(codeToFullName(code), evt.evt.clientX, evt.evt.clientY);
            });

            shape.on("mousemove", (evt) => {
                this.positionTooltip(evt.evt.clientX, evt.evt.clientY);
            });

            shape.on("mouseleave", () => {
                this.stage.container().style.cursor = "default";
                shape.stroke("#9E9E9E");
                shape.strokeWidth(1);
                shape.getLayer()?.batchDraw();
                this.hideTooltip();
            });

            shape.on("click", () => this.forwardStateClick(code));

            this.shapesByCode.set(code, shape);
        });

        // Tiny states: render right column (north -> south), centered vertically
        tinyQueue.sort((a, b) => a.center[1] - b.center[1]);
        const baseY = this.getTinyBaseY(tinyQueue.length);
        tinyQueue.forEach((item, idx) => {
            this.addExternalLabelForTinyState(item.code, item.full, item.center, idx, baseY);
        });

        this.drawNeighborCountriesAndBorders();
        this.buildTerrain();
        this.placeNeighborLabels(); // “CANADA / MEXICO”
        this.placeOceanLabels();

        this.labelsLayer.batchDraw();
        this.mapLayer.draw();
    }

    public getStage(): Konva.Stage {
        return this.stage;
    }
    
    public getLayer(): Konva.Layer {
        return this.mapLayer;
    }

    //Control if map events are responded to
    public setInteractive(on: boolean) {
        this.mapLayer.listening(on);
        this.labelsLayer.listening(on); 
    }
    //control: Show/hide terrain; pause animation when hidden.
    public setTerrainVisible(show: boolean) {
        if (!this.terrainGroup) return;
        this.terrainGroup.visible(show);
        if (show) this.riverAnim?.start();
        else this.riverAnim?.stop();
        this.mapLayer.batchDraw();
    }

    public show() {
        this.stage.visible(true);
        this.containerEl.style.display = "block";
        this.drawAll();
    }

    public hide() {
        this.stage.visible(false);
        this.containerEl.style.display = "none";
        this.drawAll();
    }
}