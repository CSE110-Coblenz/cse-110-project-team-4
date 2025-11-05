import { QuestionToggleView, Toggles } from "../views/QuestionToggleView";
import { QuestionBankModel, BankJSON } from "../models/QuestionBank"
import { ALL_STATES } from "../utils/constants";

export class QuestionToggleController {
    private model: QuestionBankModel;
    private view: QuestionToggleView;
    private currentToggled: Toggles;

    constructor(container: string) {
        this.currentToggled = { 
            "capitalQuestions": false, 
            "flowerQuestions": false, 
            "abbreviationQuestions": false 
        }
        this.view = new QuestionToggleView(this.handleBack, this.toggleOption, this.saveOptions, container);
        this.model = new QuestionBankModel();
    }

    // handler function when a back button is clicked
    // it should route back to the main, startup screen
    handleBack = () => {
        // for the time being, serve as a caller to simulate getting the next question form the question bank
        let result = this.getNextQuestion();
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
        this.model.setQuestions(options);
        this.model.resetRemainingStates();
        console.log(this.model.getQuestions());
    }

    /** gets and returns info necessary for one question, removing that state from the pool
     * return format:
     * {question state name, question type, correct answer, [wrong ans, wrong ans, wrong ans]}
     */
    getNextQuestion(): {state: string, type: string, 
            answer: string, incorrect: string[]} | null {
        let questions: BankJSON = this.model.getQuestions();
        // check that questions have been initialized + at least 1 state remains
        if (Object.keys(questions).length == 0 || this.model.getRemainingStates().length == 0) {
            return null;
        }

        let incorrectAnswers: string[] = [];

        // choose random state name + question type
        let out = {state: "", type: "", 
            answer: "", incorrect: incorrectAnswers}
        let randomIndex: number = Math.floor(Math.random() * Object.keys(questions).length);
        let randomStateIndex: number = Math.floor(Math.random() * this.model.getRemainingStates().length);
        let randomType: string = Object.keys(questions)[randomIndex];
        let randomState: string = this.model.getRemainingStates()[randomStateIndex];
        this.model.removeRemainingStates(randomStateIndex);

        out["state"] = randomState;
        out["type"] = randomType;
        out["answer"] = questions[randomType][randomState];

        let tempStates: string[] = [...ALL_STATES];
        tempStates.splice(tempStates.indexOf(randomState), 1);

        // choose 3 of the 49 non-correct states to grab fake answers from
        incorrectAnswers = [];
        for (let i = 0; i < 3; i++) {
            let idx: number = Math.floor(Math.random() * tempStates.length);
            let stateName: string = tempStates[idx];
            tempStates.splice(idx, 1);
            incorrectAnswers.push(questions[randomType][stateName]);
        }

        out["incorrect"] = incorrectAnswers;

        return out;
    }

    getView(): QuestionToggleView {
        return this.view;
    }

    getModel(): QuestionBankModel {
        return this.model;
    }
}
