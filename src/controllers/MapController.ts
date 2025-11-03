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

/**
* MapController: Map page controller.
* Glue together View, Model, and a UI bus for navigation.
*/
export class MapController {
    // Hold view instance after mount to allow redraws.
    private view?: MapViewTopo;

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
        this.view = new MapViewTopo({
            containerId,
            states: this.store.getAll(),

            onStateClick: (s) => {
                // Demo: 
                // Cycle state on click for demo (NotStarted → Partial → Complete → NotStarted).
                const next =
                    s.status === StateStatus.NotStarted ? StateStatus.Partial :
                    s.status === StateStatus.Partial    ? StateStatus.Complete : 
                                                            StateStatus.NotStarted;
                // update the store; subscribers (e.g., the View) will redraw with new fills.
                this.store.setStatus(s.code, next);

                // Delegate navigation to UI; controller does not touch router/DOM.
                this.uiBus.goToQuestionsFor(s); //UIController.ts

                // Emit a global CustomEvent
                window.dispatchEvent(new CustomEvent("usmap:stateClick", {
                    detail: { code: s.code, nextStatus: next }
                }));
            }
        });
        
        // Subscribe to Model: whenever data changes, redraw the View (one-way data flow).
        this.store.subscribe(() => {
            this.view?.redraw(this.store.getAll());
        });
    }
}