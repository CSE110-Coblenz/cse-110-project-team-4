import { QuestionBankModel, BankJSON } from "../models/QuestionBankModel";
import { ALL_STATES } from "../utils/constants";
import { Question, QuestionType, Answer, AnswerStatus } from "../models/Questions";

export class QuizManager {
    private questionBank?: QuestionBankModel;
    private hasInit: boolean;

    constructor() {
        this.hasInit = false;
    }

    public init(questionBank: QuestionBankModel) {
        console.log("INIT SUCCESSFUL", questionBank);
        this.hasInit = true;
        this.questionBank = questionBank;
    }

    /** gets and returns info necessary for one question, removing that state from the pool
     * return format:
     * {question state name, question type, correct answer, [wrong ans, wrong ans, wrong ans]}
     */
    getNextQuestion(): Question | null {
        if (this.questionBank == null) {
            return null;
        }
        let questions: BankJSON = this.questionBank.getQuestions();
        // check that questions have been initialized + at least 1 state remains
        if (Object.keys(questions).length == 0 || this.questionBank.getRemainingStates().length == 0) {
            return null;
        }

        let incorrectAnswers: string[] = [];

        // choose random state name + question type
        let randomIndex: number = Math.floor(Math.random() * Object.keys(questions).length);
        let randomStateIndex: number = Math.floor(Math.random() * this.questionBank.getRemainingStates().length);
        let randomType: string = Object.keys(questions)[randomIndex];
        let randomState: string = this.questionBank.getRemainingStates()[randomStateIndex];
        this.questionBank.removeRemainingStates(randomStateIndex);

        let typeString: string = "";
        // adapter for json key to QuestionType
        let qType: QuestionType = QuestionType.Capital;
        switch (randomType) {
            case "capitalQuestions":
                qType = QuestionType.Capital;
                typeString = "capital";
                break;
            case "flowerQuestions":
                qType = QuestionType.Flower;
                typeString = "state flower";
                break;
            case "abbreviationQuestions":
                qType = QuestionType.Abbreviation;
                typeString = "abbreviation";
                break;
            default:
                typeString = "no type found"
        }
        let questionString: string = `What is the ${typeString} for ${randomState}?`;

        let answer: Answer = {
            answerText: questions[randomType][randomState],
            status: AnswerStatus.NotSelected
        }
    
        return new Question(randomState, qType, questionString, answer);
    }

    getIncorrectAnswers(state: string, type: string): Answer[] | null {
        if (this.questionBank == null) {
            return null;
        }
        let incorrectAnswers: Answer[] = [];

        let tempStates: string[] = [...ALL_STATES];
        tempStates.splice(tempStates.indexOf(state), 1);

        // choose 3 of the 49 non-correct states to grab fake answers from
        incorrectAnswers = [];
        for (let i = 0; i < 3; i++) {
            let idx: number = Math.floor(Math.random() * tempStates.length);
            let stateName: string = tempStates[idx];
            tempStates.splice(idx, 1);
            let ans: Answer = {
                answerText: this.questionBank.getQuestions()[type][stateName],
                status: AnswerStatus.NotSelected
            }
            incorrectAnswers.push(ans);
        }

        return incorrectAnswers;
    }

    public getStatus(): boolean {
        return this.hasInit;
    }

    public getQuestionBank(): QuestionBankModel | null {
        if (this.questionBank) {
            return this.questionBank;
        }
        return null;
    }
}