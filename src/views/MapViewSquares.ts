// src/views/MapViewSquares.ts
// This file Only for the first test! 
// later will be replaced by Maptopo map.
/*=============================
  VIEW LAYER:
  Konva-based “tile” US map for stage-1.
  - Renders labeled rectangles
  - Hover: pointer + slight scale + shadow
  - Color by StateStatus
  - Emits clicks via injected callback
==============================*/
// Use Konva to draw the "state box + label"; encapsulate it into a View.
// Just for the mini main game map test.
// cavans : please switch to adaptive browser mode later. (State shape + canvas)

import Konva from "konva";
import { StateStatus, USState } from "../models/State";
import GameStatsLightbox from "../ui/game-stats-lightbox";

//testing squre, just for view test.
const TILE = {
    w: 72,
    h: 72,
    gap: 6,
    fontSize: 12
}as const; //read only

// // State → Color 
// View responsibility: styles are defined in the View,to avoid polluting the Model
function fillByStatus(s: StateStatus): string {
    // Green if quiz complete
    if (s === StateStatus.Complete) return "#43A047";
    // light pink, if partially completed
    if (s === StateStatus.Partial)  return "#F8BBD0";
    // white, init
    return "#FFFFFF";                                  
}

// A simplified "US map" by rows any columns. Here's a sample for test, and we'll add all 50 states later.
// Description: Positions are artificial "tile maps," this facilitates minimal implementation and testability.
const STATE_GRID: Record<string, { row: number; col: number; name: string }> = {
    // west-cost
    "WA": { row: 0, col: 1, name: "Washington" },
    "OR": { row: 1, col: 1, name: "Oregon" },
    "CA": { row: 2, col: 1, name: "California" },
    // Mountain States
    "ID": { row: 1, col: 2, name: "Idaho" },
    "NV": { row: 2, col: 2, name: "Nevada" },
    "AZ": { row: 3, col: 2, name: "Arizona" },
    "UT": { row: 2, col: 3, name: "Utah" },
    "CO": { row: 2, col: 4, name: "Colorado" },
    "NM": { row: 3, col: 4, name: "New Mexico" },
    // Middle 
    "MT": { row: 0, col: 3, name: "Montana" },
    "WY": { row: 1, col: 3, name: "Wyoming" },
    "ND": { row: 0, col: 5, name: "North Dakota" },
    "SD": { row: 1, col: 5, name: "South Dakota" },
    "NE": { row: 2, col: 5, name: "Nebraska" },
    "KS": { row: 3, col: 5, name: "Kansas" },
    "OK": { row: 4, col: 5, name: "Oklahoma" },
    "TX": { row: 5, col: 5, name: "Texas" },
    //Great Lakes/Central and Western
    "MN": { row: 0, col: 6, name: "Minnesota" },
    "IA": { row: 2, col: 6, name: "Iowa" },
    "MO": { row: 3, col: 6, name: "Missouri" },
    "WI": { row: 0, col: 7, name: "Wisconsin" },
    "IL": { row: 1, col: 7, name: "Illinois" },
    "AR": { row: 4, col: 6, name: "Arkansas" },
    "LA": { row: 5, col: 6, name: "Louisiana" },    
    // East
    "MI": { row: 1, col: 8, name: "Michigan" },
    "IN": { row: 2, col: 8, name: "Indiana" },
    "KY": { row: 3, col: 8, name: "Kentucky" },
    "TN": { row: 4, col: 8, name: "Tennessee" },
    "MS": { row: 5, col: 7, name: "Mississippi" },
    "AL": { row: 5, col: 8, name: "Alabama" },
    "GA": { row: 5, col: 9, name: "Georgia" },
    "FL": { row: 6, col: 9, name: "Florida" },
    "SC": { row: 4, col: 9, name: "South Carolina" },
    "NC": { row: 3, col: 9, name: "North Carolina" },
    "VA": { row: 2, col: 9, name: "Virginia" },
    "WV": { row: 2, col: 10, name: "West Virginia" },
    "OH": { row: 1, col: 9, name: "Ohio" },
    "PA": { row: 1, col: 10, name: "Pennsylvania" },
    "NY": { row: 0, col: 10, name: "New York" },
    "NJ": { row: 1, col: 11, name: "New Jersey" },
    "MD": { row: 2, col: 11, name: "Maryland" },
    "DE": { row: 2, col: 12, name: "Delaware" },
    "CT": { row: 0, col: 11, name: "Connecticut" },
    "RI": { row: 0, col: 12, name: "Rhode Island" },
    "MA": { row: 0, col: 13, name: "Massachusetts" },
    "VT": { row: 0, col: 9,  name: "Vermont" },
    "NH": { row: 0, col: 14, name: "New Hampshire" },
    "ME": { row: 0, col: 15, name: "Maine" },
    "DC": { row: 2, col: 13, name: "District of Columbia" },
    // AK / HI is placed in the lower left corner.
    "AK": { row: 7, col: 1, name: "Alaska" },
    "HI": { row: 7, col: 2, name: "Hawaii" }
};


// Row and column coordinates → top-left pixel
// layout utility function
function cellToXY(row: number, col: number): { x: number; y: number } {
    return {
        x: col * (TILE.w + TILE.gap),
        y: row * (TILE.h + TILE.gap)
    };
}

//View constructor options, injected via DI
//reuse the View (any container/data); delegate click handling to controller.
export type MapViewSquaresOptions = {
    containerId: string;                  // target DOM container id
    states: USState[];                    // data to render (external SoT)
    onStateClick?: (s: USState) => void;  //click callback (to controller)
};


/*  
MapViewSquares：Default export class: the module's main export.
*/
export default class MapViewSquares {
    private stage: Konva.Stage; // Konva Stage (root)
    private layer: Konva.Layer; // single Layer (extensible)
    private statsLayer: Konva.Layer; // separate layer for the lightbox
    private stats: GameStatsLightbox; // reference to the lightbox


    /*
    * constructor：Canvas size
    * Create stage/layer and perform the first draw (template entry).
    */
    constructor(private opts: MapViewSquaresOptions) {
        this.stage = new Konva.Stage({
            container: opts.containerId,
            width:  1280,
            height: 720
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        this.drawAll(); //first render

        // create a separate layer for the lightbox
        this.statsLayer = new Konva.Layer();
        this.stage.add(this.statsLayer);

        // instantiate lightbox
        this.stats = new GameStatsLightbox({
            greyCount: 48,
            greenCount: 1,
            redCount: 1,
        });

        // add lightbox to its own layer
        this.statsLayer.add(this.stats.getGroup());
        this.statsLayer.draw();
    }

    /*
    * Redraw entry: re-render with new states; View keeps no business state.
    */
    public redraw(states: USState[]) {
        this.opts = { ...this.opts, states };
        this.layer.destroyChildren();           // clear previous nodes
        this.drawAll();                       
    }

    /*
    * Actual drawing: build Rect + Text per state, wire interactions, add to layer.
    */
    private drawAll() {
        const { states } = this.opts;
        states.forEach((s) => {
            const grid = STATE_GRID[s.code];
            if (!grid) return; //skip unknown states
            const { x, y } = cellToXY(grid.row, grid.col);
            
            const group = new Konva.Group({ x, y });
            // state testing shape, Rect: state tile (with stroke & rounded corners)
            const rect = new Konva.Rect({
                x:0, y:0,
                width: TILE.w,
                height: TILE.h,
                fill: fillByStatus(s.status),
                stroke: "#9E9E9E",
                strokeWidth: 1,
                cornerRadius: 4,
                shadowEnabled: true,
                shadowBlur: 0,
                shadowOpacity: 0
            });

            // Text label: state code (centered; non-listening so rect handles events)
            const label = new Konva.Text({
                x:0, y:0,
                width: TILE.w,
                height: TILE.h,
                text: s.code,
                fontSize: TILE.fontSize,
                fontStyle: "bold",
                align: "center",
                verticalAlign: "middle",
                listening: false
            });

            // Mouse Hover: 
            // pointer cursor + slight scale + shadow animation
            group.on("mouseenter", () => {
                this.stage.container().style.cursor = "pointer";
                // more the State to the top layer
                group.moveToTop();
                this.layer.batchDraw();

                group.to({
                    scaleX: 1.20,
                    scaleY: 1.23,
                    duration: 0.08
                });
                rect.to({
                    shadowBlur: 10,
                    shadowOpacity: 0.28,
                    duration: 0.08
                });
            });
            
            group.on("mouseleave", () => {
                this.stage.container().style.cursor = "default";
                group.to({ scaleX: 1, scaleY: 1, duration: 0.08 });
                rect.to({
                    shadowBlur: 0,
                    shadowOpacity: 0,
                    duration: 0.08
                });
            });

            // Click: bubble state back to outside (Passive View + DI)
            group.on("click", () => {
                this.opts.onStateClick?.(s);
            });

            // Add to layer (order matters for stacking)
            group.add(rect);
            group.add(label);
            this.layer.add(group);
        });

        this.layer.draw();
    }
}