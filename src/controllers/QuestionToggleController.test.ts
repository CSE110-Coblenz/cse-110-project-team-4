import { describe, it, expect } from "vitest";
import { QuestionToggleController } from "./QuestionToggleController";
import Konva from "konva";

describe("question toggle controller", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let QTC = new QuestionToggleController(new Konva.Stage({container: mockEl.id}));

    it("should initialize a view and model", () => {
        expect(QTC.getView()).toBeDefined();
        expect(QTC.getModel()).toBeDefined();
    })

    // this should eventually be moved to a question bank....
    it("should be able to properly get questions", () => {
        let selectedStates: string[] = [];
        let opts = ["capitalQuestions", "abbreviationQuestions"];
        QTC.getModel().setQuestions(opts);
        for (let i = 0; i < 50; i++) {
            let q = QTC.getNextQuestion()!;
            let keys = Object.keys(q);
            expect(QTC.getModel().getRemainingStates().length).toEqual(49 - i);
            expect(keys.length).toEqual(4);
            let nextState = q["state"];
            expect(selectedStates.indexOf(nextState)).toEqual(-1);
            selectedStates.push(nextState);
            expect(q["incorrect"].indexOf(q["answer"])).toEqual(-1);
            expect(opts.indexOf(q["type"])).toBeGreaterThan(-1);
        }
    })
})