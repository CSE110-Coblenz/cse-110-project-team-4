// src/controllers/MapController.ts
/*=============================
  CONTROLLER LAYER:
    Orchestrates interactions between View and Model.
    Mounts tile map view
    On click: cycles status + triggers UI navigation
    Subscribes to store changes and redraws view
    Exposes getStage(), getStore(), and getSelectedState() for external controllers
    Tracks currently selected state for integration with UI and stats controllers
    
    Controller: bridges UI and Model; translates user interactions into business calls.
    Sprint 2 updates (Nov 2025):
        - Added getStage(), getStore(), getSelectedState() accessor methods
        - Stores selectedState reference on click events
==============================*/

//import MapViewSquares from "../views/MapViewSquares";
import MapViewTopo from "../views/MapViewTopo";
import { StateStatus, USState } from "../models/State";
import { StateStore } from "../models/StateStore";
import Konva from "konva";

/**
* MapController: Map page controller.
* Glue together View, Model, and a UI bus for navigation.
*/
export class MapController {
    // Hold view instance after mount to allow redraws.
    private view?: MapViewTopo;
    private mapLayer?: Konva.Layer;          // was: Konva.Layer
    private selectedState: USState | null = null;

    public setUIBus(bus: { goToQuestionsFor: (s: USState) => void }) {
        this.uiBus = bus; // allow late wiring
    }

    constructor(
        private store: StateStore,
        private uiBus: { goToQuestionsFor: (state: USState) => void } // UI bus (navigation)
    ) {}

    /**
    * mount:
    * Role: mount the View into a container and wire "store changes → view redraw".
    */
    public mount(containerId: string) {
        // First render the View with data and click handler.
        console.log("Mounting MapController to:", containerId);
        this.view = new MapViewTopo({
            containerId,
            states: this.store.getAll(),

            onStateClick: (s) => {
                // Demo:================================== 
                // Cycle state on click for demo (NotStarted → Partial → Complete → NotStarted).
                const next =
                    s.status === StateStatus.NotStarted ? StateStatus.Partial :
                    s.status === StateStatus.Partial    ? StateStatus.Complete : 
                                                            StateStatus.NotStarted;
                // update the store; subscribers (e.g., the View) will redraw with new fills.
                this.store.setStatus(s.code, next);
                // store which state was clicked
                this.selectedState = s;
                if (this.uiBus && this.uiBus.goToQuestionsFor) {
                    this.uiBus.goToQuestionsFor(s);
                } else {
                    console.error("UI Bus not properly initialized!");
                }

                // Emit a global CustomEvent
                window.dispatchEvent(new CustomEvent("usmap:stateClick", {
                    detail: { code: s.code, nextStatus: next }
                }));
            }
        });
        
        this.mapLayer = this.view?.getLayer?.();

        // Subscribe to Model: whenever data changes, redraw the View (one-way data flow).
        this.store.subscribe(() => {
            this.view?.redraw(this.store.getAll());
        });
    }

    public setInteractive(enabled: boolean) {
        // Delegate to the view so the Controller does not need to know layer details.
        if ((this.view as any)?.setInteractive) {
            (this.view as any).setInteractive(enabled);
            return;
        }

        // Fallback: toggle only the known map layer if present (older views).
        const layer = this.mapLayer ?? this.view?.getLayer?.();
        if (layer) {
            layer.listening(enabled);       // only map layer
        }
    }

    public getStage(): Konva.Stage | undefined {
        return this.view?.getStage();
    }

    public getStore(): StateStore {
        return this.store;
    }

    public getSelectedState(): USState | null {
        return this.selectedState;
    }    
    
    public getView() {
        return this.view;
    }
}
