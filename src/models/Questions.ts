interface TypeJSON {
    [key: string]: string
}

interface BankJSON {
    [key: string]: TypeJSON
}

export default class QuestionBank {
    private currQuestionBank: BankJSON;
    public static allQuestions: BankJSON;
    private remainingStates: string[];

    constructor() {
        this.currQuestionBank = {};
        this.remainingStates = []; // should be an array of all states, preferrably defined by some constant
    }

    public setQuestions(options: string[]): void {
        let totalQuestions = this.getAllQuestions();
        if (totalQuestions == null) {
            console.log("WARNING WARNING TOTAL QUESTIONS IS NULL");
        }
        this.currQuestionBank = {};
        options.forEach((option) => {
            this.currQuestionBank[option] = totalQuestions![option];
        })
        console.log(this.currQuestionBank);
    }

    public getNextQuestion(): {state: string, type: string, 
            answer: string, incorrect: string[]} | null {
        if (this.currQuestionBank == null) {
            return null;
        }

        let incorrectAnswers: string[] = [];

        let out = {state: "", type: "", 
            answer: "", incorrect: incorrectAnswers}
        let randomIndex: number = Math.floor(Math.random() * Object.keys(this.questionBank).length);
        let randomStateIndex: number = Math.floor(Math.random() * this.remainingStates.length);
        let randomType: string = Object.keys(this.currQuestionBank)[randomIndex];
        let randomState: string = this.remainingStates[randomStateIndex];
        this.remainingStates.splice(randomStateIndex, 1);

        out["state"] = randomState;
        out["type"] = randomType;
        out["answer"] = this.currQuestionBank[randomType][randomState];

        let tempStates: string[] = [] // dummy until constant of 50 states is defined
            // instead this should be a copy of that constant
        tempStates.splice(tempStates.indexOf(randomState), 1);

        incorrectAnswers = []
        for (let i = 0; i < 3; i++) {
            let idx: number = Math.floor(Math.random() * tempStates.length);
            let stateName: string = tempStates[idx];
            tempStates.splice(idx, 1);
            incorrectAnswers.push(this.currQuestionBank[randomType][stateName]);
        }

        out["incorrect"] = incorrectAnswers;

        return out;
    }

    public getAllQuestions() {
        if (QuestionBank.allQuestions == null) {
            fetch("../fullQuestionData.json")
            .then((res) => {
                return res.json();
            })
            .then((jsonData) => {
                QuestionBank.allQuestions = jsonData;
                return QuestionBank.allQuestions;
            })
        } else {
            return QuestionBank.allQuestions;
        }
    }
}