import { QuestionToggleView, Toggles } from "../views/QuestionToggleView";
import { QuestionBankModel, BankJSON } from "../models/QuestionBankModel";
import Konva from "konva";

export class QuestionToggleController {
    private model: QuestionBankModel;
    private view: QuestionToggleView;
    private currentToggled: Toggles;

    constructor(stage: Konva.Stage, id: string) {
        this.currentToggled = { 
            "capitalQuestions": false, 
            "flowerQuestions": false, 
            "abbreviationQuestions": false 
        }
        this.view = new QuestionToggleView(this.tempHandler, this.handleBack, this.toggleOption, this.saveOptions, stage, id);
        // eventually, once we make a quizmanager or whatever, we should pass in the model created from there instead of initializing it here
        this.model = new QuestionBankModel();
    }

    // handler function when a back button is clicked to hide popup
    handleBack = () => {
        let inputEl = document.getElementById("nameInput");
        if (inputEl) {
            inputEl.style.display = "block";
        }
        this.view.hide();
    }

    // temporary function handler to demonstrate question getting
    tempHandler = () => {
        let result = null; //this.getNextQuestion();
        if (result == null) {
            console.log("question list null or empty");
        } else {
            console.log("remaining states:", this.model.getRemainingStates());
            console.log("state:", result["state"]);
            console.log("type:", result["type"]);
            console.log("answer:", result["answer"]);
            console.log("incorrect:", result["incorrect"]);
        }
    }

    // handler function to update when a toggle button is clicked, updates options
    toggleOption = (key: keyof Toggles) => {
        this.currentToggled[key] = !this.currentToggled[key];
        console.log("curr options", this.currentToggled)
    }

    // sends the model the selected options to save
    saveOptions = () => {
        let options: string[] = Object.keys(this.currentToggled).filter((x) => this.currentToggled[x]);
        if (options.length === 0) {
            // temporary alert, should eventually make it display some text for x seconds i think
            alert("please select at least one question type (temp message)")
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
    }

    initDefault(): void {
        this.model.setQuestions(["capitalQuestions"]);
    }
}
