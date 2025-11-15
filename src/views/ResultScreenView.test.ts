import { describe, it, expect } from "vitest";
import { ResultScreenView } from "./ResultScreenView";

describe("info card view", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let RSV = new ResultScreenView(() => {}, "main-menu-container");

    it("should generate a layer and stage", () => {
        expect(RSV.getLayer()).toBeDefined();
        expect(RSV.getStage()).toBeDefined();
    })

    it("should initially be invisible", () => {
        expect(RSV.getStage()["attrs"]["visible"]).toBeFalsy();
    })

    it("should be visible after showing", () => {
        RSV.show();
        expect(RSV.getStage()["attrs"]["visible"]).toBeTruthy();
    })

    it("should be invisible after hiding", () => {
        RSV.hide();
        expect(RSV.getStage()["attrs"]["visible"]).toBeFalsy();
    })
})