// src/controllers/MapController.ts
/*=============================
  CONTROLLER LAYER:
    Orchestrates interactions between View and Model.
    Mounts tile map view
    On click: cycles status + triggers UI navigation
    Subscribes to store changes and redraws view
    
    Controller: bridges UI and Model; translates user interactions into business calls.
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
        const layer = this.mapLayer ?? this.view?.getLayer?.();
        if (layer) {
            layer.listening(enabled);           // only map layer
            layer.opacity(enabled ? 1 : 0.9);
        } else {
            const st = this.view?.getStage();   // fallback: freeze whole stage
            if (st) st.listening(enabled);
        }
    }

    public getStage(): Konva.Stage | undefined {
        return this.view?.getStage();
    }
    
}

