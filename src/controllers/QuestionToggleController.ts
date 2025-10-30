import { QuestionToggleView, Toggles } from "../views/QuestionToggleView";
import { QuestionBankModel, BankJSON } from "../models/QuestionBank"
import { ALL_STATES } from "../utils/constants";

export class QuestionToggleController {
    private model: QuestionBankModel;
    private view: QuestionToggleView;
    private currentToggled: Toggles;
    // potentially might use a screenSwitcher?

    constructor() {
        this.currentToggled = { 
            "capitalQuestions": false, 
            "flowerQuestions": false, 
            "abbreviationQuestions": false 
        }
        this.view = new QuestionToggleView(this.handleBack, this.toggleOption, this.saveOptions);
        this.model = new QuestionBankModel();
    }

    handleBack = () => {
        console.log("!!!! we should try to go back screens here... for now here's a random question");
        // swap to menu screen, for now for testing purposes i made this button just print a sample question
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

    toggleOption = (key: keyof Toggles) => {
        this.currentToggled[key] = !this.currentToggled[key];
        console.log("curr options", this.currentToggled)
    }

    saveOptions = () => {
        let options: string[] = Object.keys(this.currentToggled).filter((x) => this.currentToggled[x]);
        this.model.setQuestions(options);
        console.log(this.model.getQuestions());
    }

    getNextQuestion(): {state: string, type: string, 
            answer: string, incorrect: string[]} | null {
        let questions: BankJSON = this.model.getQuestions();
        if (Object.keys(questions).length == 0 || this.model.getRemainingStates().length == 0) {
            return null;
        }

        let incorrectAnswers: string[] = [];

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
}