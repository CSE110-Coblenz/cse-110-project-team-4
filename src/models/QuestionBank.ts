import { allQuestions } from "../utils/fullQuestions"
import { ALL_STATES } from "../utils/constants"

interface TypeJSON {
    [key: string]: string
}

export interface BankJSON {
    [key: string]: TypeJSON
}

export class QuestionBankModel {
    public static allQuestions: BankJSON;

    private currQuestionBank: BankJSON;
    private remainingStates: string[];

    constructor() {
        this.currQuestionBank = {};
        this.remainingStates = [...ALL_STATES];
    }

    // get an array of states that have not been answered yet
    getRemainingStates(): string[] {
        return this.remainingStates;
    }

    // remove the states at idx from the remaining states array
    removeRemainingStates(idx: number): string {
        if (idx < 0 || idx > this.remainingStates.length) {
            return "";
        }
        let out: string = this.remainingStates[idx];
        this.remainingStates.splice(idx, 1);
        return out;
    }

    // get a list of all currently enabled questions
    getQuestions(): BankJSON {
        return this.currQuestionBank;
    }

    // set the list of currently enabled questions from an options array
    setQuestions(options: string[]): void {
        this.currQuestionBank = {};
        options.forEach((option) => {
            if (Object.keys(allQuestions).indexOf(option) != -1) {
                this.currQuestionBank[option] = allQuestions[option];
            }
        })
    }
}