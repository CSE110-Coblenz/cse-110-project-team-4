import { describe, it, expect,vi } from "vitest";
import { QuestionToggleController } from "./QuestionToggleController";
import Konva from "konva";
import { ConfigurationModel } from "../models/ConfigurationModel";
import { GameStatsController } from "./GameStatsController";
import { UIController } from "./UIController";


describe("question toggle controller", () => {
    const mockEl = document.createElement("div");
    mockEl.id = "main-menu-container";
    document.body.appendChild(mockEl);

    const stage = new Konva.Stage({
        container: mockEl.id,
        width: 400,
        height: 300,
    });
    const config = new ConfigurationModel(); 
    const statsMock = {
        updateMaxErrors: vi.fn(),
    } as unknown as GameStatsController;

    const uiMock = {
        updateMaxErrors: vi.fn(),
    } as unknown as UIController;

    let QTC = new QuestionToggleController(
        stage,
        "main-menu-container",
        config,
        statsMock,
        uiMock,
        () => {} // onBackCallback
    );

    it("should initialize a view and model", () => {
        expect(QTC.getView()).toBeDefined();
        expect(QTC.getModel()).toBeDefined();
    })

    it("should update the toggles when toggleOption is called", () => {
        let toggles = QTC.toggleOption("flowerQuestions")
        QTC.toggleOption("capitalQuestions")
        expect(toggles["capitalQuestions"]).toBeTruthy();
        expect(toggles["flowerQuestions"]).toBeTruthy();
        expect(toggles["abbreviationQuestions"]).toBeFalsy();
    })

    it("should be able to toggle options off", () => {
        let toggles = QTC.toggleOption("capitalQuestions")
        expect(toggles["capitalQuestions"]).toBeFalsy();
        expect(toggles["flowerQuestions"]).toBeTruthy();
        expect(toggles["abbreviationQuestions"]).toBeFalsy();
    })
})