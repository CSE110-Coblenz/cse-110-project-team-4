// src/models/Question.ts
/*=============================
    MODEL LAYER: 
    Domain types for the US map quiz.  
===============================
    Contract for other layers; no rendering or persistence here.
      Enum: allowed progress states.
      Type: 
*/

export enum AnswerStatus {
    NotSelected = "NotSelected",
    Selected    = "Selected"
}

// Domain object for a single answer.
export type Answer = {                   // For flexibility, correctness is not stored in the Answer object itself.
    answerText: string;
    status: AnswerStatus;
}

// Exposed so controllers/views can import and use them.
export enum QuestionStatus {
    Unanswered = "Unanswered", 
    Correct    = "Correct",
    Incorrect  = "Incorrect"
    // Skipped = "Skipped"  ...  If we want to let players skip certain questions entirely, e.g. like a skip "power-up".
}

export enum QuestionType {
    Capital = "capitalQuestions", 
    Flower  = "flowerQuestions",
    Abbreviation = "abbreviationQuestions"
}

// Domain object for a single question.
export class Question {
    public readonly state: string;                // the US state this question is about.
    public readonly type: QuestionType;            // Can be capital, flower, history. Check enum above.
    public readonly questionText: string;          // The question being asked.

    private status: QuestionStatus;                // Current question state.
    private correctAnswer: Answer;                 // The correct answer. 
    private incorrectAnswers: Answer[] = [];

    constructor (
        state: string, 
        type: QuestionType, 
        questionText: string, 
        correctAnswer: Answer,                      
    ) {         
        this.state = state;                                    
        this.type = type;  
        this.questionText = questionText;
        this.status = QuestionStatus.Unanswered;
        this.correctAnswer = correctAnswer;                     
    }

    getWhichType(): QuestionType {
        return this.type;
    }

    getStatus(): QuestionStatus {
        return this.status;
    }

    getShuffledAnswers(): Answer[] {
        const answers = [this.correctAnswer, ...this.incorrectAnswers];  
        return answers.sort(() => Math.random() - 0.5);
    }

    setIncorrectAnswers(incorrect: Answer[]) {
        this.incorrectAnswers = incorrect;
    }

    setStatus(newStatus: QuestionStatus): void {
        this.status = newStatus;
    }

    isCorrect(givenAnswer: Answer): boolean {
        return givenAnswer.answerText === this.correctAnswer.answerText;
    }
}
