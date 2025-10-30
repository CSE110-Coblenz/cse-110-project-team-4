import { describe, it, expect } from "vitest";
import { QuestionToggleView, Toggles } from "./QuestionToggleView";

describe("question toggle view", () => {
    let QTV = new QuestionToggleView(() => {}, (p: keyof Toggles) => {}, () => {});

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