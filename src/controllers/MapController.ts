// src/controllers/MapController.ts
/*=============================
  CONTROLLER LAYER:
  Orchestrates interactions between View and Model.
    Mounts tile map view
    On click: cycles status + triggers UI navigation
    //Subscribes to store changes and redraws view
==============================*/
// Controller: bridges UI and Model; translates user interactions into business calls.

import Konva from "konva";
import MapViewSquares from "../views/MapViewSquares";
import { StateStatus, USState } from "../models/State";
import { StateStore } from "../models/StateStore";
import { drawQuestionCard } from "../views/QuestionCardView";

/**
* MapController: Map page controller.
* Glue together View, Model, and a UI bus for navigation.
*/
export class MapController {
    // Hold view instance after mount to allow redraws.
    private view?: MapViewSquares;
    private questionLayer?: Konva.Layer;

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
        this.view = new MapViewSquares({
            containerId,
            states: this.store.getAll(),
            onStateClick: (s) => {
                // Demo: first click promotes NotStarted to Partial
                if (s.status === StateStatus.NotStarted) {
                    this.store.setStatus(s.code, StateStatus.Partial);
                }
                // Delegate navigation to UI; controller does not touch router/DOM.
                this.uiBus.goToQuestionsFor(s); //UIController.ts
            }
        });
        
        // Subscribe to Model: whenever data changes, redraw the View (one-way data flow).
        this.store.subscribe(() => {
            this.view?.redraw(this.store.getAll());
        });
    }

    // depends on ../views/QuestionCardView.ts
    public showQuestionCard() {
        // Safety check: first make sure map is mounted 
        if (!this.view) {
            console.warn("Map view is not initialized yet. Did you call mount()?");
            return;
        }

        // Check if question card already exists
        if (this.questionLayer) {
            this.questionLayer.show();
            return;
        }

        const stage = this.view.getStage();
        const questionLayer = drawQuestionCard();

        // Add the question layer to the same stage as the map
        stage.add(questionLayer);

        // Store reference to MapController Class
        this.questionLayer = questionLayer;
    }

    // depends on ../views/QuestionCardView.ts
    public hideQuestionCard() {
        if (!this.view) {
            console.warn("Map view is not initialized yet. Did you call mount()?");
            return;
        }

        if (!this.questionLayer) {
            console.warn("There is no question card to hide.");
            return;
        }

        this.questionLayer.hide();
        this.view.getStage().batchDraw();
    }
}