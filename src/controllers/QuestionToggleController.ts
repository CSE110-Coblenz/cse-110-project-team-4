// src/controllers/QuestionToggleController.ts
/*==============================================================================
QuestionToggleController

Public API
- constructor(stage: Konva.Stage, id: string)
- handleBack() - handler for view, routes back to welcome screen
- toggleOption(key: keyof Toggles) - handler for view, turns on/off question type for key
- saveOptions() - updates model to match current option select
- getView() 
- getModel()
- handleResize()
- initDefault() - in case no questions are selected

Design Notes
- View handler functions implemented here for MVC

Related
- View: src/views/QuestionToggleView.ts
- Model: src/models/QuestionBankModel.ts
- Parent: src/controllers/WelcomeScreenController.ts
==============================================================================*/

import { QuestionToggleView, Toggles } from "../views/QuestionToggleView";
import { QuestionBankModel } from "../models/QuestionBankModel";
import { PopUpView } from "../views/PopUpView";
import Konva from "konva";

export class QuestionToggleController {
    private model: QuestionBankModel;
    private view: QuestionToggleView;
    private currentToggled: Toggles;
    private popup: PopUpView;

    constructor(stage: Konva.Stage, id: string) {
        this.currentToggled = { 
            "capitalQuestions": false, 
            "flowerQuestions": false, 
            "abbreviationQuestions": false,
            "dateQuestions": false 
        }
        this.view = new QuestionToggleView(this.handleBack, this.toggleOption, this.saveOptions, stage, id);
        this.model = new QuestionBankModel();
        this.popup = new PopUpView(this.view.getLayer(), "Please enable at least one question type.");
    }

    // handler function when a back button is clicked to hide popup
    handleBack = () => {
        let inputEl = document.getElementById("nameInput");
        if (inputEl) {
            inputEl.style.display = "block";
        }
        this.view.hide();
    }

    // handler function to update when a toggle button is clicked, updates options
    toggleOption = (key: keyof Toggles) => {
        this.currentToggled[key] = !this.currentToggled[key];
        return this.currentToggled
    }

    // sends the model the selected options to save
    saveOptions = () => {
        let options: string[] = Object.keys(this.currentToggled).filter((x) => this.currentToggled[x]);
        if (options.length === 0) {
            this.popup.show()
            setTimeout(() => {this.popup.hide()}, 3000)
            return;
        }
        this.model.setQuestions(options);
        this.model.resetRemainingStates();
        console.log(this.model.getQuestions());
    }

    getView(): QuestionToggleView {
        return this.view;
    }

    getModel(): QuestionBankModel {
        return this.model;
    }

    handleResize(): void {
        this.view.resize();
        this.popup.resize();
    }

    initDefault(): void {
        this.model.setQuestions(["capitalQuestions"]);
    }
}
