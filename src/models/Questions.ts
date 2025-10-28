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
        this.remainingStates = []; // should be an array of all states, preferrably copying some constant

        this.getAllQuestions();
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
        let totalQuestions = this.getAllQuestions();
        if (totalQuestions == null) {
            console.log("WARNING WARNING TOTAL QUESTIONS IS NULL");
            return;
        }
        this.currQuestionBank = {};
        options.forEach((option) => {
            this.currQuestionBank[option] = totalQuestions![option];
        })
    }

    getAllQuestions() {
        if (QuestionBankModel.allQuestions == null) {
            fetch("fullQuestionData.json")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("fetch request uncompleted, perhaps the path is wrong");
                }
                return res.json();
            })
            .then((jsonData) => {
                QuestionBankModel.allQuestions = jsonData;
                return QuestionBankModel.allQuestions;
            })
            .catch((error) => {
                console.log("issue with fetching question json:", error);
            })
        } else {
            return QuestionBankModel.allQuestions;
        }
    }
}