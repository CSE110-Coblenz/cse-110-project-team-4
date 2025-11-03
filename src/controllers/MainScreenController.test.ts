import { describe, it, expect } from "vitest";
import { MainScreenController } from "./MainScreenController";
import { ScreenSwitcher } from "../utils/types";

describe("main screen controller", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let switcher: ScreenSwitcher = new ScreenSwitcher();
    let MSC = new MainScreenController("main-menu-container", switcher);

    it("should initialize a view and togglecontroller", () => {
        expect(MSC.getView()).toBeDefined();
    })
})