// src/models/Question.ts
/*=============================
    MODEL LAYER: 
    Domain types for the US map quiz.  
===============================
    Contract for other layers; no rendering or persistence here.
      Enum: allowed progress states.
      Type: 
*/

import { USState } from "./State";

// Exposed so controllers/views can import and use them.
export enum QuestionStatus {
    Unanswered = "Unanswered", 
    Correct    = "Correct",
    Incorrect  = "Incorrect"
    // Skipped = "Skipped"  ...  If we want to let players skip certain questions entirely, e.g. like a skip "power-up".
}

export enum QuestionType {
    Capital = "Capital", 
    Flower  = "Flower",
    History = "History"
}

// Domain object for a single question.
export class Question {
    readonly state: USState;                // the US state this question is about.
    readonly which: QuestionType;           // Can be capital, flower, history. Check enum above.
    private status: QuestionStatus;                 // Current question state.
    readonly questionText: string;          // The question being asked.
    private correctAnswer: Answer;                  // The correct answer. 

    constructor (
        state: USState, 
        which: QuestionType, 
        questionText: string, 
        correctAnswer: Answer,                      
    ) {         
        this.state = state;                                    
        this.which = which;  
        this.status = QuestionStatus.Unanswered;
        this.questionText = questionText;
        this.correctAnswer = correctAnswer;                     
    }

    getUSState(): USState {
        return this.state;
    }

    getWhichType(): QuestionType {
        return this.which;
    }

    getStatus(): QuestionStatus {
        return this.status;
    }

    getCorrectAnswer(): Answer {
        return this.correctAnswer;
    }
}


export enum AnswerStatus {
    NotSelected = "NotSelected",
    Selected    = "Selected"
}

// Domain object for a single answer.
export type Answer = {                   // For flexibility, correctness is not stored in the Answer object itself.
    answerText: string;
    status: AnswerStatus;
}