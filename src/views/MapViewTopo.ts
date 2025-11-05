// src/views/MapViewTopo.ts
/*=============================
VIEW LAYER (MVC)
    Topo-based US map rendered with Konva Paths.
        - Renders real state shapes from TopoJSON via d3-geo projection.
        - Hover: pointer + slight scale + shadow (drawn above neighbors only within canvas).
        - Color by StateStatus (white / pink / green).
        - Emits clicks via injected callback (controller -> UI bus).

    Related files:
        - Controller: src/controllers/MapController.ts
        - Model/Store: src/models/State.ts, src/models/StateStore.ts
        - ID mapping: src/maps/us-id-to-code.ts

    Update history:
        Sprint2 :
        - Update States name show CA-> .
        Sprint1 :
        - MapViewTopo.ts change States shape to real Geo-shape form square.
        Demo:
        - MapViewSquares.ts  simple map within States squares and catch mouseover event.
==============================*/

import Konva from "konva";
import { feature } from "topojson-client";   // TopoJSON -> GeoJSON
import * as d3geo from "d3-geo";             // projection & path generator
import us from "us-atlas/states-10m.json";   // US TopoJSON data
import { usStateIdToCode } from "../data/maps/UsIdToCode"; // FIPS id -> "CA"
import { StateStatus, USState } from "../models/State";
import { codeToFullName, TINY_STATES } from "../data/maps/UsCodeToName";

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
const CHIP_BG = "#ffffffff";
const CHIP_STROKE = "#8aa0b3";
const CHIP_ROW = 26;
//  Mouse hover High light
const HOVER_STROKE = "#061480ff";
const HOVER_STROKE_WIDTH = 2;
// Fixed Spasming issue: make hit region wider to stabilize hover on small shapes
const HIT_STROKE_WIDTH = 20;
// ================================================================================

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

// Sprint 1 topo main part: 
export default class MapViewTopo {
    private stage: Konva.Stage;
    private baseLayer: Konva.Layer;  // normal shape
    private containerEl: HTMLElement;

    // sprint2:  
    private abbrevLayer: Konva.Layer;           // in-map abbreviations
    private uiLayer: Konva.Layer;               // floating tooltip
    private externalLabelsLayer: Konva.Layer;   // tiny states' external labels
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

    constructor(private opts: MapViewTopoOptions) {
        this.containerEl = document.getElementById(opts.containerId)!;
        // Init Konva stage sized to container (ResizeObserver keeps it in sync).        
        const size = this.getContainerSize();
        this.stage = new Konva.Stage({
            container: opts.containerId,
            width: size.width,
            height: size.height
        });
        this.baseLayer = new Konva.Layer();

        //sprint2
        this.abbrevLayer = new Konva.Layer();            // in-map abbreviations
        this.uiLayer = new Konva.Layer();                // floating tooltip
        this.externalLabelsLayer = new Konva.Layer();    // external labels + leader lines
        // Tiny States layer
        this.uiLayer.listening(false);

        this.stage.add(this.baseLayer);
        this.stage.add(this.abbrevLayer);
        this.stage.add(this.uiLayer);
        this.stage.add(this.externalLabelsLayer);
        
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
        this.projection = d3geo.geoAlbersUsa().fitSize([width, height], {
            type: "FeatureCollection",
            features: this.geoFeatures
        } as any);
        this.geoPath = d3geo.geoPath(this.projection);
    }

    // drawAll():
    // - Full draw (isRedraw=false): rebuild everything.
    // - Incremental (isRedraw=true): only update fills.
    private drawAll(isRedraw = false) {
        if (!isRedraw) {
            this.baseLayer.destroyChildren();
            this.abbrevLayer.destroyChildren();
            this.externalLabelsLayer.destroyChildren();

            this.shapesByCode.clear();
            this.chipsByCode.clear();   
        } else {
            // Update fills only
            this.byCode.forEach((state, code) => {
                const shape = this.shapesByCode.get(code);
                if (shape) shape.fill(fillByStatus(state.status));

                const chip = this.chipsByCode.get(code);
                if (chip) chip.rect.fill(fillByStatus(state.status));
            });

            this.baseLayer.batchDraw();
            this.externalLabelsLayer.batchDraw();
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

            const shape = new Konva.Path({
                data: pathData,
                fill: fillByStatus(stateToDraw.status),
                stroke: "#9E9E9E",
                strokeWidth: 1,
                hitStrokeWidth: HIT_STROKE_WIDTH,
                shadowEnabled: false
            });

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
                this.abbrevLayer.add(abbrev);
            } else {
                tinyQueue.push({ code, full: codeToFullName(code), center: [cx, cy] });
            }

            // States' events
            shape.on("mouseenter", (evt) => {
                this.stage.container().style.cursor = "pointer";
                shape.stroke(HOVER_STROKE);
                shape.strokeWidth(HOVER_STROKE_WIDTH);
                shape.moveToTop();
                shape.getLayer()?.batchDraw();
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

            this.baseLayer.add(shape);
            this.shapesByCode.set(code, shape);
        });

        // Tiny states: render right column (north -> south), centered vertically
        tinyQueue.sort((a, b) => a.center[1] - b.center[1]);
        const baseY = this.getTinyBaseY(tinyQueue.length);
        tinyQueue.forEach((item, idx) => {
            this.addExternalLabelForTinyState(item.code, item.full, item.center, idx, baseY);
        });

        this.externalLabelsLayer.batchDraw();
        this.abbrevLayer.batchDraw();
        this.baseLayer.draw();
    }

    // Sprint 2 Tooltip helpers ===================================
    private showTooltip(text: string, clientX: number, clientY: number) {
        this.tooltipText.text(text);
        this.tooltipBg.width(this.tooltipText.width() + 12);
        this.tooltipBg.height(this.tooltipText.height() + 12);

        const { x, y } = this.toStagePos(clientX, clientY);
        this.tooltipGroup.position({ x: x + 12, y: y + 12 });
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
        const index = orderIndex ?? this.externalLabelsLayer.find(".ext-label").length;

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
            this.externalLabelsLayer.batchDraw();
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
            this.externalLabelsLayer.batchDraw();
        });

        const onClick = () => this.forwardStateClick(code);
        group.on("click", onClick);
        line.on("click", onClick);

        this.externalLabelsLayer.add(line);
        this.externalLabelsLayer.add(group);

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

    public getStage(): Konva.Stage {
        return this.stage;
    }
    
    public getLayer(): Konva.Layer {
        return this.baseLayer;
    }
}