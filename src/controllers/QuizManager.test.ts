import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
import { MinigameController } from "./MinigameController";
import Konva from "konva"
import { MinigameController } from "./MinigameController";

// Mock ResizeObserver meant for Konva
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock class for MinigameController to satisfy the type check
const mockMinigame: MinigameController = {
    restart: vi.fn(), 
} as unknown as MinigameController;

// Seed data
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
    // Declare variables at the top level
    let stage: Konva.Stage;
    let switcher: ScreenSwitcher;
    let quiz: QuizManager;
    let store: StateStore;
    let bank: QuestionBankModel;
    let map: MapController;
    let stats: GameStatsController;
    let timer: TimerController;
    let ui: UIController;
    let minigame: MinigameController;

    beforeEach(() => {
        // 1. Setup Fake Timers
        vi.useFakeTimers();

        // 2. Create fresh DOM elements
        document.body.innerHTML = '';
        const mockEl = document.createElement("div");
        const inputEl = document.createElement("input");
        mockEl.id = "main-menu-container";
        inputEl.id = "nameInput";
        document.body.appendChild(mockEl);
        document.body.appendChild(inputEl);

        // 3. Initialize Instances
        stage = new Konva.Stage({
            container: mockEl, 
            width: 800,
            height: 600,
        });

        switcher = new ScreenSwitcher();
        quiz = new QuizManager(switcher);
        store = new StateStore(seed);
        bank = new QuestionBankModel();
        bank.setQuestions(["capitalQuestions"]);
        
        map = new MapController(
            store,
            { openQuestion: (q: any) => {} }
        );
        
        stats = new GameStatsController(map);
        timer = new TimerController(new TimerModel(300), new TimerViewCorner(stage), switcher);
        ui = new UIController(map, stats, quiz);
        minigame = mockMinigame;
    });

    afterEach(() => {
        // 4. CRITICAL: Destroy stage to stop Konva from trying to draw on null canvas
        if (stage) {
            stage.destroy();
        }
        // 5. Clear timers
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("should start unitialized", () => {
        expect(quiz.getStatus()).toBeFalsy();
        expect(quiz.getNextQuestion()).toBeNull();
        expect(quiz.getIncorrectAnswers("California", "capitalQuestions")).toBeNull();
        expect(quiz.getQuestionBank()).toBeNull();
    })

    it("should be initialized after calling init", () => {
        quiz.init(bank, stats, ui, timer, map, minigame);
        expect(quiz.getStatus()).toBeTruthy();
    })

    it("should be able to return questions", () => {
        // Fix here: Init the quiz so it has data
        quiz.init(bank, stats, ui, timer, map, minigame);

        expect(quiz.getNextQuestion() === null).toBeFalsy();
        expect(quiz.getIncorrectAnswers("California", "capitalQuestions") === null).toBeFalsy();
        expect(quiz.getIncorrectAnswers("", "")).toBeNull();
        expect(quiz.getQuestionBank() === null).toBeFalsy();
    })
});