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

    getRemainingStates(): string[] {
        return this.remainingStates;
    }

    removeRemainingStates(idx: number): string {
        if (idx < 0 || idx > this.remainingStates.length) {
            return "";
        }
        let out: string = this.remainingStates[idx];
        this.remainingStates.splice(idx, 1);
        return out;
    }

    getQuestions(): BankJSON {
        return this.currQuestionBank;
    }

    setQuestions(options: string[]): void {
        this.currQuestionBank = {};
        options.forEach((option) => {
            this.currQuestionBank[option] = allQuestions[option];
        })
    }
}