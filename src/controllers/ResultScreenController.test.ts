import { describe, it, expect, vi } from "vitest";
import { ResultScreenController } from "./ResultScreenController";
import { ScreenSwitcher } from "../utils/types";
import { QuizManager } from "./QuizManager"
import { ConfigurationModel } from "../models/ConfigurationModel";

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe("result screen controller", () => {
    let switcher: ScreenSwitcher = new ScreenSwitcher();
    const config = new ConfigurationModel(); 
    let quiz: QuizManager = new QuizManager(switcher);

    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let RSC = new ResultScreenController(quiz, switcher, "main-menu-container");

    it("should initialize a view", () => {
        expect(RSC.getView()).toBeDefined();
    })
})