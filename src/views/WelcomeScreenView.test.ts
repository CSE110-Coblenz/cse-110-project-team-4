import { describe, it, expect } from "vitest";
import { WelcomeScreenView } from "./WelcomeScreenView";

describe("question toggle view", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let MSV = new WelcomeScreenView(() => {}, () => {}, () => {}, "main-menu-container");

    it("should generate a layer, stage, and input element", () => {
        expect(MSV.getLayer()).toBeDefined();
        expect(MSV.getStage()).toBeDefined();
        expect(MSV.getInput()).toBeDefined();
    })

    it("should initially be invisible", () => {
        expect(MSV.getStage()["attrs"]["visible"]).toBeFalsy();
    })

    it("should be visible after showing", () => {
        MSV.show();
        expect(MSV.getStage()["attrs"]["visible"]).toBeTruthy();
    })

    it("should be invisible after hiding", () => {
        MSV.hide();
        expect(MSV.getStage()["attrs"]["visible"]).toBeFalsy();
    })
})