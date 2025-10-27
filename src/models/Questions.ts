interface TypeJSON {
    [key: string]: string
}

interface BankJSON {
    [key: string]: TypeJSON
}

export default class QuestionBank {
    private questionBank: BankJSON;
    private remainingStates: string[];

    constructor() {
        this.questionBank = {};
        this.remainingStates = []; // should be an array of all states, preferrably defined by some constant
    }

    public setQuestions(options: string[]): void {

    }

    public getNextQuestion(): {state: string, type: string, 
            answer: string, incorrect: string[]} | null {
        if (this.questionBank == null) {
            return null;
        }

        let incorrectAnswers: string[] = [];

        let out = {state: "", type: "", 
            answer: "", incorrect: incorrectAnswers}
        let randomIndex: number = Math.floor(Math.random() * Object.keys(this.questionBank).length);
        let randomStateIndex: number = Math.floor(Math.random() * this.remainingStates.length);
        let randomType: string = Object.keys(this.questionBank)[randomIndex];
        let randomState: string = this.remainingStates[randomStateIndex];
        this.remainingStates.splice(randomStateIndex, 1);

        out["state"] = randomState;
        out["type"] = randomType;
        out["answer"] = this.questionBank[randomType][randomState];

        let tempStates: string[] = [] // dummy until constant of 50 states is defined
            // instead this should be a copy of that constant
        tempStates.splice(tempStates.indexOf(randomState), 1);

        incorrectAnswers = []
        for (let i = 0; i < 3; i++) {
            let idx: number = Math.floor(Math.random() * tempStates.length);
            let stateName: string = tempStates[idx];
            tempStates.splice(idx, 1);
            incorrectAnswers.push(this.questionBank[randomType][stateName]);
        }

        out["incorrect"] = incorrectAnswers;

        return out;
    }
}