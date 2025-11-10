import { describe, it, expect } from "vitest";
import { QuestionToggleView, Toggles } from "./QuestionToggleView";
import Konva from "konva";

describe("question toggle view", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let QTV = new QuestionToggleView(() => {}, () => {}, (p: keyof Toggles) => {}, () => {}, new Konva.Stage({container: mockEl.id}), "main-menu-container");

    it("should generate a layer", () => {
        expect(QTV.getLayer()).toBeDefined();
    })

    it("should initially be invisible", () => {
        expect(QTV.getLayer()["attrs"]["visible"]).toBeFalsy();
    })

    it("should be visible after showing", () => {
        QTV.show();
        expect(QTV.getLayer()["attrs"]["visible"]).toBeTruthy();
    })

    it("should be invisible after hiding", () => {
        QTV.hide();
        expect(QTV.getLayer()["attrs"]["visible"]).toBeFalsy();
    })
})