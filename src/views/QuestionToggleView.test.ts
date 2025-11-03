import { describe, it, expect } from "vitest";
import { QuestionToggleView, Toggles } from "./QuestionToggleView";

describe("question toggle view", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "container";
    document.body.appendChild(mockEl);
    let QTV = new QuestionToggleView(() => {}, (p: keyof Toggles) => {}, () => {}, "container");

    it("should generate a layer", () => {
        expect(QTV.getStage()).toBeDefined();
    })

    it("should initially be invisible", () => {
        expect(QTV.getStage()["attrs"]["visible"]).toBeFalsy();
    })

    it("should be visible after showing", () => {
        QTV.show();
        expect(QTV.getStage()["attrs"]["visible"]).toBeTruthy();
    })

    it("should be invisible after hiding", () => {
        QTV.hide();
        expect(QTV.getStage()["attrs"]["visible"]).toBeFalsy();
    })
})