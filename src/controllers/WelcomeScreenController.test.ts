import { describe, it, expect, vi } from "vitest";
import { WelcomeScreenController } from "./WelcomeScreenController";
import { ScreenSwitcher } from "../utils/types";
import { QuizManager } from "./QuizManager"

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe("main screen controller", () => {
    const mockEl = document.createElement("div");
    const inputEl = document.createElement("input");
    mockEl.id = "main-menu-container";
    inputEl.id = "nameInput";
    document.body.appendChild(mockEl);
    document.body.appendChild(inputEl);
    let switcher: ScreenSwitcher = new ScreenSwitcher();
    let quiz: QuizManager = new QuizManager(switcher);
    let WSC = new WelcomeScreenController("main-menu-container", quiz);

    it("should initialize a view and togglecontroller", () => {
        expect(WSC.getView()).toBeDefined();
        expect(WSC.getToggler()).toBeDefined();
    })

    it("should give default questions if no questions selected", () => {
      WSC.handleStart();
      expect(Object.keys(WSC.getToggler().getModel().getQuestions())).toContain("capitalQuestions")
      expect(Object.keys(WSC.getToggler().getModel().getQuestions()).length === 1).toBeTruthy()
    })

    it("should swap when handleInfo() is called", () => {
      WSC.handleInfo();
      expect(WSC.getView().getInput().style.display).toEqual("none")
    })

    it("should come back when hideInfo() is called", () => {
      WSC.hideInfo();
      expect(WSC.getView().getInput().style.display).toEqual("block")
    })

    it("should swap when handleOptions() is called", () => {
      WSC.handleOptions();
      expect(WSC.getView().getInput().style.display).toEqual("none")
      expect(WSC.getToggler().getView().getLayer()["attrs"]["visible"]).toBeTruthy()
    })
})