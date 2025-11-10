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
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);
    let switcher: ScreenSwitcher = new ScreenSwitcher();
    let quiz: QuizManager = new QuizManager();
    let MSC = new WelcomeScreenController("main-menu-container", switcher, quiz);

    it("should initialize a view and togglecontroller", () => {
        expect(MSC.getView()).toBeDefined();
    })
})