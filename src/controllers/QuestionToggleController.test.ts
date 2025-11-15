import { describe, it, expect } from "vitest";
import { QuestionToggleController } from "./QuestionToggleController";
import Konva from "konva";

describe("question toggle controller", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let QTC = new QuestionToggleController(new Konva.Stage({container: mockEl.id}), "main-menu-container");

    it("should initialize a view and model", () => {
        expect(QTC.getView()).toBeDefined();
        expect(QTC.getModel()).toBeDefined();
    })

    it("should update the toggles when toggleOption is called", () => {
        let toggles = QTC.toggleOption("flowerQuestions")
        QTC.toggleOption("capitalQuestions")
        expect(toggles["capitalQuestions"]).toBeTruthy();
        expect(toggles["flowerQuestions"]).toBeTruthy();
        expect(toggles["abbreviationQuestions"]).toBeFalsy();
    })

    it("should be able to toggle options off", () => {
        let toggles = QTC.toggleOption("capitalQuestions")
        expect(toggles["capitalQuestions"]).toBeFalsy();
        expect(toggles["flowerQuestions"]).toBeTruthy();
        expect(toggles["abbreviationQuestions"]).toBeFalsy();
    })
})