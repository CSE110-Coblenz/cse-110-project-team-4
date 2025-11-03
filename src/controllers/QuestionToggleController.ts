import { QuestionToggleView, Toggles } from "../views/QuestionToggleView";
import { QuestionBankModel, BankJSON } from "../models/QuestionBank"
import { ALL_STATES } from "../utils/constants";
import { Question, QuestionType, Answer, AnswerStatus } from "../models/Questions";
import { QuestionCard } from "../views/QuestionCardView";

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
            console.log("answer:", result["correctAnswer"]);
            console.log("incorrect:", result["incorrectAnswers"]);
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
     * Step by step: Randomly select a state, question type, incorrect answers, to compile into a Question object
     * return format:
     * {question state name, question type, correct answer, [wrong ans, wrong ans, wrong ans]}
     */
    getNextQuestion(): Question | null {
        let questions: BankJSON = this.model.getQuestions();
        const remainingStates = this.model.getRemainingStates();

        // check that questions have been initialized + at least 1 state remains
        if (Object.keys(questions).length == 0 || this.model.getRemainingStates().length == 0) {
            return null;
        }

        // start building Question object (choose state & question type, write text, identify correct answer)
        const randomStateIndex = Math.floor(Math.random() * remainingStates.length); 
        const randomState = remainingStates[randomStateIndex]; 
        this.model.removeRemainingStates(randomStateIndex);

        const questionTypes = Object.keys(questions) as QuestionType[];
        const randomTypeIndex = Math.floor(Math.random() * questionTypes.length); 
        const randomType = questionTypes[randomTypeIndex];

        const questionText = `What is the ${randomType} of ${randomState}?`;

        const correctAnswer: Answer = {
            answerText: questions[randomType][randomState],
            status: AnswerStatus.NotSelected
        }

        const question = new Question(randomState, randomType, questionText, correctAnswer);

        let tempStates: string[] = [...ALL_STATES];
        tempStates.splice(tempStates.indexOf(randomState), 1);

        // choose 3 of the 49 non-correct states to grab fake answers from
        let incorrect: Answer[] = [];

        for (let i = 0; i < 3; i++) {
            let idx: number = Math.floor(Math.random() * tempStates.length);
            let stateName: string = tempStates[idx];
            tempStates.splice(idx, 1);
            incorrect.push({
                answerText: questions[randomType][stateName],
                status: AnswerStatus.NotSelected
            });
        }

        question.setIncorrectAnswers(incorrect);
        return question;
    }

    showNextQuestion(questionCard: QuestionCard): void {
        const nextQuestion = this.getNextQuestion();

        if (nextQuestion) { 
            questionCard.setQuestion(nextQuestion); 
        } else {
            return;
        }
    }

    handleConfirm(questionCard: QuestionCard): void {

    }


    getView(): QuestionToggleView {
        return this.view;
    }

    getModel(): QuestionBankModel {
        return this.model;
    }
}