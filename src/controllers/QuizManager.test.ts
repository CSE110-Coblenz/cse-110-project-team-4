import { describe, it, expect, vi } from "vitest";
import { ScreenSwitcher } from "../utils/types";
import { QuizManager } from "./QuizManager"
import { TimerController } from "./TimerController";
import { TimerModel } from "../models/TimerModel";
import TimerViewCorner from "../views/TimerDisplayView"
import { QuestionBankModel } from "../models/QuestionBankModel";
import { GameStatsController } from "./GameStatsController";
import { UIController } from "./UIController";
import { MapController } from "./MapController";
import { USState } from "../models/State";
import { StateStore } from "../models/StateStore";
import { StateStatus } from "../models/State";
import Konva from "konva"

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

const seed: USState[] = Object.keys({
    WA:1, OR:1, CA:1, ID:1, NV:1, AZ:1, UT:1, CO:1, NM:1,
    MT:1, WY:1, ND:1, SD:1, NE:1, KS:1, OK:1, TX:1,
    MN:1, IA:1, MO:1, WI:1, IL:1, AR:1, LA:1,
    MI:1, IN:1, KY:1, TN:1, MS:1, AL:1, GA:1, FL:1, SC:1, NC:1,
    VA:1, WV:1, OH:1, PA:1, NY:1, NJ:1, MD:1, DE:1, CT:1, RI:1, MA:1, VT:1, NH:1, ME:1, DC:1,
    AK:1, HI:1
}).map(code => ({
    code,
    name: code,
    status: StateStatus.NotStarted
}));

describe("main screen controller", () => {
    const mockEl = document.createElement("div");
    const inputEl = document.createElement("input");
    mockEl.id = "main-menu-container";
    inputEl.id = "nameInput";
    document.body.appendChild(mockEl);
    document.body.appendChild(inputEl);

    let stage = new Konva.Stage({container: "main-menu-container"})
    let switcher: ScreenSwitcher = new ScreenSwitcher();
    let quiz: QuizManager = new QuizManager(switcher);
    let store: StateStore = new StateStore(seed);

    let bank = new QuestionBankModel();
    bank.setQuestions(["capitalQuestions"]);
    let map = new MapController(
                store,
                { goToQuestionsFor: (_s: USState) => {} }
            );
    let stats = new GameStatsController(map);
    let timer = new TimerController(new TimerModel(300), new TimerViewCorner(stage), switcher)
    let ui = new UIController(map, stats, quiz);

    it("should start unitialized", () => {
        expect(quiz.getStatus()).toBeFalsy();
        expect(quiz.getNextQuestion()).toBeNull();
        expect(quiz.getIncorrectAnswers("California", "capitalQuestions")).toBeNull();
        expect(quiz.getQuestionBank()).toBeNull();
    })

    it("should be initialized after calling init", () => {
        quiz.init(bank, stats, ui, timer, map);
        expect(quiz.getStatus()).toBeTruthy();
    })

    it("should be able to return questions", () => {
        expect(quiz.getNextQuestion() === null).toBeFalsy();
        expect(quiz.getIncorrectAnswers("California", "capitalQuestions") === null).toBeFalsy();
        expect(quiz.getIncorrectAnswers("", "")).toBeNull();
        expect(quiz.getQuestionBank() === null).toBeFalsy();
    })
})