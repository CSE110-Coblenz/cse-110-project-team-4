// src/main.ts
/*=============================
APP ENTRY:
    -Compose Model + Controller + UI; mount the map.
    -Seeds demo data
    -Hooks keyboard shortcuts for quick testing

For test, plz feel free to modifty / add something.
    App entrypoint: initialize Model, Controller, and View. Keep sync and structure clear.

10/28/2025 update: 
BOOT ORDER — Application Startup Sequence
  1) Import runtime deps & types
  2) Compose Models & Services (no UI code)
  3) Compose Controllers (wire model ↔ view)
  4) Mount Views (attach to HTML container)
  5) Seed / Demo Hooks (timers / shortcuts)
  6) Navigation & UI Bus Wiring (router/modals)
  
  11/10/2025 update (Sprint 2):
  - Initialize GameStatsController before UIController to enable stats tracking
  - Pass GameStatsController into UIController for point/count updates on answers
==============================*/


//=================   1) Import runtime deps & types
//	  Put: type definitions / state store / controllers / UI bus.
//	  Example in this project:
//		- State/Map: StateStore, MapController, UIController
//		- Quiz: (later) QuizManager, QuestionBank
//		- Score: (later) LeaderBoardService
import { StateStatus, USState } from "./models/State";
import { StateStore } from "./models/StateStore";
import { MapController } from "./controllers/MapController";
import { UIController } from "./controllers/UIController";
import { GameStatsController } from "./controllers/GameStatsController";
import './styles/app.css';
import { TimerModel } from "./models/TimerModel";
import TimerViewCorner from "./views/TimerDisplayView";
import { TimerController } from "./controllers/TimerController";
import { ScreenSwitcher, Screens } from "./utils/types";
import { WelcomeScreenController } from "./controllers/WelcomeScreenController";
import Konva from "konva";
import { QuizManager } from "./controllers/QuizManager";
import { ResultScreenController } from "./controllers/ResultScreenController";


//=================   2) Compose Models & Services (no UI/DOM here)
//	  Put: initial data sources, services, singletons (pure logic).
//	  Where teammates should add later:
//		- Question data: `import { QuestionBank } from "./models/QuestionBank";`
//		  const questionBank = new QuestionBank(/* load JSON or remote */);
//		- Scoring/Leaderboard: `import { LeaderBoard } from "./models/LeaderBoard";`
//		  const leaderBoard = new LeaderBoard(/* storage */);
//		- Card matching (minigame): `import { CardStateManager } from "./models/CardStateManager";`
//		  const cardState = new CardStateManager();

/* TEST-seed: minimal demo data for all 50 states. 
 * Replace with persisted data if we finish the data part. */

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
const store = new StateStore(seed);

//=================    3) Compose Controllers
//	  Put: business controllers that connect model and view (no rendering details).
//	  Where teammates should add later:
//		- Quiz flow: `import { QuizManager } from "./controllers/QuizManager";`
//		  const quiz = new QuizManager(questionBank, leaderBoard);
//		- Minigame flow: `import { MinigameController } from "./controllers/MinigameController";`
//		  const minigame = new MinigameController(cardState);

// application class stores controllers, modeled after lab design
class Application extends ScreenSwitcher {
    private ui: UIController;
    private map: MapController;
    private menu: WelcomeScreenController;
    private stats: GameStatsController;
    private manager: QuizManager;
    private leaderboard: ResultScreenController;

    // initialize most controllers
    constructor(store: StateStore) {
        super();
        this.manager = new QuizManager(this);
        this.map = new MapController(
            store,
            { goToQuestionsFor: (_s: USState) => {} }
        );
        this.stats = new GameStatsController(this.map);
        this.ui = new UIController(this.map, this.stats, this.manager);
        this.menu = new WelcomeScreenController("welcome-root", this.manager);
        this.leaderboard = new ResultScreenController(this.manager, this, "leaderboard-root");
    }

    // finish initializations that have certain dependencies
    // mount views onto divs
    init() {
        this.map.mount("map-root");
        this.map.getView()?.hide();
        this.menu.getView().show();
        this.stats.attemptReconnect();
        let stageForUI = this.map.getStage();
        if (stageForUI) {
            this.ui.mount(stageForUI)
            this.map.setUIBus(this.ui);      // hand real UI bus back to MapController
            const timerView = new TimerViewCorner(stageForUI);
            const timerCtrl = new TimerController(new TimerModel(), timerView);
            this.manager.init(this.menu.getToggler().getModel(), this.stats, this.ui, timerCtrl, this.map);
        }

        // temp debug
        window.addEventListener("keydown", (ev) => {
            if (ev.key.toLowerCase() === "f") {
                store.getAll().forEach(s => store.setStatus(s.code, StateStatus.Complete));
            }
            if (ev.key.toLowerCase() === "r") {
                store.getAll().forEach(s => store.setStatus(s.code, StateStatus.NotStarted));
            }
            if (ev.key.toLowerCase() === 'o' && ev.ctrlKey) {
                this.ui.triggerFireworksTest();
            }
        });
        this.stats;
    }

    // to be called for "big" screen switch, e.g. welcome -> map, or map <-> minigame
    public switchToScreen(screen: Screens): void {
        this.leaderboard.getView().hide();
        this.map.getView()!.hide();
        this.menu.getView().hide();

        switch (screen) {
            case Screens.Map:
                this.map.getView()!.show();
                break;
            case Screens.Welcome:
                this.menu.getView().show();
                break;
            case Screens.Leaderboard:
                this.leaderboard.getView().show();
                break;
            default: 
        }
    }
}

const app = new Application(store);
app.init();

//=================    4) Mount Views
//	  Put: attach views to HTML containers only.
//  Why: keep main.ts focused on composition/boot order (SRP).
//
//  Where teammates should add later (IDs are already reserved in index.html):
//  - Map view (center canvas):
//      mapView.mount(ensureEl("map-root"))
//  - Questions panel (center overlay Q&A box):
//      questionsView.mount(ensureEl("qa-box"))
//  - Leaderboard view (separate view/page):
//      leaderboardView.mount(ensureEl("leaderboard-root"))
//  - Welcome/Home view (separate view/page):
//      welcomeView.mount(ensureEl("welcome-root"))
//  - Settings view (separate view/page):
//      settingsView.mount(ensureEl("settings-root"))
//  - HUD (bottom-left: score/progress/timer):
//      hudView.mount(ensureEl("hud"))
//  - Toolbar (top-left: back/home/help/settings buttons):
//      toolbarView.mount(ensureEl("toolbar"))
//
//  Functional overlay layers (singletons; mount render roots or controllers):
//  - Modal/Drawer portal:
//      modalManager.mount(ensureEl("portal-root"))
//  - Toast/Notifications:
//      toastService.mount(ensureEl("toast-root"))
//  - Full-screen overlay (loading/route guard):
//      overlayService.mount(ensureEl("overlay-root"))

//	  Where teammates should add later:
//		- Questions panel view: `questionsView.mount("questions-container")`
//		- Leaderboard view: `leaderboardView.mount("leaderboard-container")`

//=================    5) Seed / Demo Hooks (removable)
//	  Put: quick local demo helpers (timers, shortcuts). Do NOT ship to prod.
//	  Where teammates can test quickly:
//		- Preload a quiz for CA: `quiz.loadFor("CA")`
//		- Bump score for demo: `leaderBoard.addPoints("player1", 10)`



//=================    6) Navigation & UI Bus Wiring (router/modals)
//	  Put: connections to router or modal/dialog system (keep outside Controller/Store).
//	  Where teammates should add later:
//		- Router: `import { AppRouter } from "./controllers/AppRouter";`
//		  const router = new AppRouter(); router.start(); ui.setRouter(router);
//		- Modal service: `import { ModalService } from "./controllers/ModalService";`
//		  const modal = new ModalService(); ui.setModal(modal);
//	  Example: in UIController.goToQuestionsFor(...), open a modal or navigate:
//		- modal.open(<QuestionsView code={state.code} />)  OR  router.push(`/questions/${state.code}`)
