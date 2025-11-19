import { describe, it, expect } from "vitest";
import { InfoCardView } from "./InfoCardView";
import Konva from "konva";

describe("info card view", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let ICV = new InfoCardView(new Konva.Stage({container: mockEl.id}), "main-menu-container", () => {});

    it("should generate a layer", () => {
        expect(ICV.getLayer()).toBeDefined();
    })

    it("should initially be invisible", () => {
        expect(ICV.getLayer()["attrs"]["visible"]).toBeFalsy();
    })

    it("should be visible after showing", () => {
        ICV.show();
        expect(ICV.getLayer()["attrs"]["visible"]).toBeTruthy();
    })

    it("should be invisible after hiding", () => {
        ICV.hide();
        expect(ICV.getLayer()["attrs"]["visible"]).toBeFalsy();
    })
})