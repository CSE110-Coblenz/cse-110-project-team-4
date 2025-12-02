import { describe, it, expect, vi } from "vitest";
import { WelcomeScreenController } from "./WelcomeScreenController";
import { ScreenSwitcher } from "../utils/types";
import { QuizManager } from "./QuizManager"
import { ConfigurationModel } from "../models/ConfigurationModel";
import { UIController } from "./UIController";
import { MapController } from "./MapController";
import { GameStatsController } from "./GameStatsController";

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe("main screen controller", () => {
    const mockEl = document.createElement("div");
    const inputEl = document.createElement("input");
    const config = new ConfigurationModel();

    mockEl.id = "main-menu-container";
    inputEl.id = "nameInput";

    document.body.appendChild(mockEl);
    document.body.appendChild(inputEl);
    const switcher: ScreenSwitcher = new ScreenSwitcher();
    const quiz: QuizManager = new QuizManager(switcher);
    
    const dummyMap = {
      getStore: () => ({
        getAll: () => [],
      }),
      getStage: () => null,
    } as unknown as MapController;

    const ui = {
      updateMaxErrors: vi.fn(),
      attachRoadTripDashboard: vi.fn(),
      resetRoadTripHud: vi.fn(),
    } as unknown as UIController;

    const stats = new GameStatsController(dummyMap, config);

    const WSC = new WelcomeScreenController(
    "main-menu-container",
      quiz,
      config,
      stats,
      ui
    );

    it("should initialize a view and togglecontroller", () => {
        expect(WSC.getView()).toBeDefined();
        expect(WSC.getToggler()).toBeDefined();
    })

    it("should give default questions if no questions selected", () => {
      WSC.getView().getInput().value = 'name';
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