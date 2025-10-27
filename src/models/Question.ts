// src/models/Question.ts
/*=============================
    MODEL LAYER: 
    Domain types for the US map quiz.  
===============================
    Contract for other layers; no rendering or persistence here.
      Enum: allowed progress states.
      Type: 
*/

// Exposed so controllers/views can import and use them.
export enum MCQStatus {
    Unanswered = "Unanswered", 
    Correct    = "Correct",
    Incorrect  = "Incorrect"
}

// Domain object for a single question.
export type MCQ = {
    code: string;           // e.g. "CA2" for California's second question, "MN1" for Minnesota's first question
    question: string;       // 
    correct: Answer;        // Each question will always be assigned the same correct answer. 
    status: MCQStatus;      // Current question state, function above.
};

export enum AnswerStatus {
    NotSelected = "NotSelected", 
    Selected = "Selected"
}

// Domain object for a single answer.
export type Answer = {
    answer: string;
    status: AnswerStatus;
}