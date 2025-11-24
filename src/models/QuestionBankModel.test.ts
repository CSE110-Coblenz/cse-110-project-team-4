import { describe, it, expect } from "vitest";
import { QuestionBankModel } from "./QuestionBankModel";

describe("question bank remaining states", () => {
    let QBM = new QuestionBankModel();

    it("should start at 51", () => {
        expect(QBM.getRemainingStates().length).toEqual(51);
    })

    it("should decrement after state removal", () => {
        for (let i = 1; i <= 51; i++) {
            QBM.removeRemainingStates(0);
            expect(QBM.getRemainingStates().length).toEqual(51 - i);
        }
    })

    it("should do nothing when removing from empty list", () => {
        QBM.removeRemainingStates(0);
        expect(QBM.getRemainingStates().length).toEqual(0);
    })
})

describe("question bank question set", () => {
    let QBM = new QuestionBankModel();

    it("should initially be empty", () => {
        expect(Object.keys(QBM.getQuestions()).length).toEqual(0);
    })

    it("should properly initialize", () => {
        let options = ["capitalQuestions", "abbreviationQuestions", "flowerQuestions"];
        QBM.setQuestions(options);
        let keys = Object.keys(QBM.getQuestions());
        expect(keys.length).toEqual(3);
        options.forEach(opt => {
            expect(keys).toContain(opt);
            expect(Object.keys(QBM.getQuestions()[opt]).length).toEqual(51);
        })
    })

    it("should ignore invalid options", () => {
        let options = ["abcdefg", "12345"];
        QBM.setQuestions(options);
        expect(Object.keys(QBM.getQuestions()).length).toEqual(0);
    })

    it("should properly overwrite when set multiple times", () => {
        let o1 = ["flowerQuestions", "capitalQuestions", "abbreviationQuestions"];
        let o2 = ["abbreviationQuestions"];
        let o3 = ["capitalQuestions", "abbreviationQuestions"];
        QBM.setQuestions(o1);
        QBM.setQuestions(o2);
        let keys = Object.keys(QBM.getQuestions());
        expect(keys.length).toEqual(1);
        o2.forEach(opt => {
            expect(keys).toContain(opt);
            expect(Object.keys(QBM.getQuestions()[opt]).length).toEqual(51);
        })
        QBM.setQuestions(o3);
        keys = Object.keys(QBM.getQuestions());
        expect(keys.length).toEqual(2);
        o3.forEach(opt => {
            expect(keys).toContain(opt);
            expect(Object.keys(QBM.getQuestions()[opt]).length).toEqual(51);
        })
    })
})