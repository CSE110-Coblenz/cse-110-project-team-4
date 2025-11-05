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
==============================*/


//=================   1) Import runtime deps & types
//	  Put: type definitions / state store / controllers / UI bus.
//	  Example in this project:
//		- State/Map: StateStore, MapController, UIController
//		- Quiz: (later) QuizManager, QuestionBank
//		- Score: (later) LeaderBoardService
import Konva from "konva";
import { StateStatus, USState } from "./models/State";
import { StateStore } from "./models/StateStore";
import { MapController } from "./controllers/MapController";
import { UIController } from "./controllers/UIController";
import GameStatsLightbox from "./ui/game-stats-lightbox";
import { QuestionToggleController } from "./controllers/QuestionToggleController";


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
const container = "map-container";

//=================    3) Compose Controllers
//	  Put: business controllers that connect model and view (no rendering details).
//	  Where teammates should add later:
//		- Quiz flow: `import { QuizManager } from "./controllers/QuizManager";`
//		  const quiz = new QuizManager(questionBank, leaderBoard);
//		- Minigame flow: `import { MinigameController } from "./controllers/MinigameController";`
//		  const minigame = new MinigameController(cardState);
const ui = new UIController();
const map = new MapController(store, ui);
const qToggle = new QuestionToggleController("map-container");


//=================    4) Mount Views
//	  Put: attach views to HTML containers only.
//	  Where teammates should add later:
//		- Questions panel view: `questionsView.mount("questions-container")`
//		- Leaderboard view: `leaderboardView.mount("leaderboard-container")`
map.mount("map-container");
qToggle.getView().show();


//=================    5) Seed / Demo Hooks (removable)
//	  Put: quick local demo helpers (timers, shortcuts). Do NOT ship to prod.
//	  Where teammates can test quickly:
//		- Preload a quiz for CA: `quiz.loadFor("CA")`
//		- Bump score for demo: `leaderBoard.addPoints("player1", 10)`
setTimeout(() => store.setStatus("CA", StateStatus.Complete), 1000);
setTimeout(() => store.setStatus("TX", StateStatus.Partial), 1500);

window.addEventListener("keydown", (ev) => {
	if (ev.key.toLowerCase() === "f") {
		store.getAll().forEach(s => store.setStatus(s.code, StateStatus.Complete));
	}
	if (ev.key.toLowerCase() === "r") {
		store.getAll().forEach(s => store.setStatus(s.code, StateStatus.NotStarted));
	}
});


//=================    6) Navigation & UI Bus Wiring (router/modals)
//	  Put: connections to router or modal/dialog system (keep outside Controller/Store).
//	  Where teammates should add later:
//		- Router: `import { AppRouter } from "./controllers/AppRouter";`
//		  const router = new AppRouter(); router.start(); ui.setRouter(router);
//		- Modal service: `import { ModalService } from "./controllers/ModalService";`
//		  const modal = new ModalService(); ui.setModal(modal);
//	  Example: in UIController.goToQuestionsFor(...), open a modal or navigate:
//		- modal.open(<QuestionsView code={state.code} />)  OR  router.push(`/questions/${state.code}`)
