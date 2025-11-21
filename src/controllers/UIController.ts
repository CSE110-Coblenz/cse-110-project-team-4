// src/controllers/UIController.ts
/*=============================
  UI BUS / NAV LAYER:
  Minimal UI facade.
    - Manages the "In-Game" UI layer (Questions, Overlay, Effects).
    - Coordinates between QuizManager, Stats, and Dashboard views.

  Sprint 3 updates (Nov 2025):
  - Updated mount() to pass Stage to QuestionCardView for resizing.
  - Integrated RoadTripDashboardView for bottom-center HUD updates.
  - Added resetRoadTripHud() for game restarts.

  Public API:
  + constructor(mapController: MapController, stats: GameStatsController, manager: QuizManager)
  + mount(stage: Konva.Stage): void
  + goToQuestionsFor(state: USState): void
  + answerResponse(correct: boolean): void
  + openQuestion(q: Question): void
  + closeQuestion(): void
  + attachRoadTripDashboard(view: RoadTripDashboardView): void
  + resetRoadTripHud(): void
  + dispose(): void
==============================================================================*/

import Konva from "konva";
import { USState } from "../models/State";
import { StateStatus } from "../models/State";
import { MapController } from "./MapController";
import { QuestionCardView } from "../views/QuestionCardView";
import { OverlayLayer } from "../views/OverlayLayer";

// konva effects testing:
import { FireworksView } from "../views/FireworksView";

import { GameStatsController } from "./GameStatsController";
import { Question, Answer } from "../models/Questions";
import { QuizManager } from "./QuizManager";
import { CODE_BY_FULL_NAME } from "../data/maps/UsNameToCode";
import { FeedbackCardView } from "../views/FeedbackCardView";

import { RoadTripDashboardView } from "../views/RoadTripDashboardView";

export class UIController {
	private stage!: Konva.Stage;
	private card!: QuestionCardView;
	private overlay!: OverlayLayer; 
	private statsController!: GameStatsController;
	private manager!: QuizManager;
	private currentState: USState | null;
	private feedback?: FeedbackCardView;
	private lastQuestion?: Question;

	private roadTripDashboard?: RoadTripDashboardView;

	constructor(private mapController: MapController, statsController: GameStatsController, manager: QuizManager) {
		this.statsController = statsController;
		this.currentState = null;
		this.manager = manager;
	}

	public mount(stage: Konva.Stage) {
		this.stage = stage;

		//create mask layer
		this.overlay = new OverlayLayer({
			stage: this.stage,
			onBackdropClick: () => this.closeQuestion(),
		});
		this.overlay.mount();

		this.card = new QuestionCardView(this.stage);
		this.feedback = new FeedbackCardView(stage, this.overlay);

		this.card.onConfirm((correct: boolean) => {this.answerResponse(correct)});

		this.card.getLayer().visible(false);
		this.stage.add(this.card.getLayer());
		this.card.resize(); // let question resize to fit the stage size.

		this.overlay.moveToTop();
		this.card.getLayer().moveToTop();

		// fire works:
		// FX effect layer + FireworksView
		this.fxLayer = new Konva.Layer({ listening: false });
		this.stage.add(this.fxLayer);
		this.fxLayer.moveToTop();
		this.fireworks = new FireworksView(this.fxLayer);

		this.stage.draw();
	}

	// for now, go to a random question. later (next sprint?), i think i'll add an optional parameter for manual vs. auto mode
	public goToQuestionsFor() {
		// get random question for now
		let nextQuestion: Question | null = this.manager.getNextQuestion();
		if (nextQuestion == null) {
			console.log(this.manager);
			return;
		}

		let state: USState = {
			code: CODE_BY_FULL_NAME(nextQuestion.state),
			name: nextQuestion.state,
			status: StateStatus.NotStarted
		}
		this.currentState = state;

		let incorrectAnswers: Answer[] | null =  this.manager.getIncorrectAnswers(nextQuestion.state, nextQuestion.getWhichType())!
		nextQuestion.setIncorrectAnswers(incorrectAnswers);
        
        this.openQuestion(nextQuestion);
		this.lastQuestion = nextQuestion;
		location.hash = `#questions/${state.code}`; 
	}

	public answerResponse(correct: boolean) {
		this.feedback?.show(correct, this.card);
		if (!correct) {
			this.card.highlightCorrect();
		}

		if (this.mapController && this.currentState && this.mapController.getSelectedState) {
			const currentState = this.mapController.getSelectedState?.(); // use for diff mode later?
			if (correct) {
				this.statsController.onCorrect(this.currentState.code);
			} else {
				this.statsController.onIncorrect(this.currentState.code);
			}
		}			

		// New notice the car action: ture-get star, false get roadblocks
		if (this.roadTripDashboard) {
  	    	this.roadTripDashboard.handleStateResult(correct);
    	}

		setTimeout(() => {
			this.feedback?.hide();
			this.card.clearHighlights();
			this.closeQuestion();
			setTimeout(() => {this.manager.handleNextAction()}, 500);
		}, 1000)
	}

	// public API called when a state is clicked or quiz begins
	public openQuestion(q: any) {
		if (!this.overlay || !this.card) return;

		this.mapController.setInteractive(false);
		if (q) {
			this.card.setQuestion(q as any);
		} else if (this.lastQuestion) {
			this.card.setQuestion(this.lastQuestion);
		}

		this.overlay.show();
		this.card.getLayer().visible(true);
		this.card.getLayer().moveToTop();

		this.stage.batchDraw();
	}

	public closeQuestion() {
		if (!this.overlay || !this.card) return;

		this.overlay.hide();
		this.card.getLayer().visible(false);

		this.mapController.setInteractive(true);

		this.stage.batchDraw();
	}

	public dispose() {
		this.overlay?.dispose();
	}

	// fireworks effect
	private fxLayer?: Konva.Layer; 
	private fireworks?: FireworksView; 
	public triggerFireworksTest = () => {
		this.fxLayer?.moveToTop();
		this.fireworks?.startFireworks();
		this.stage?.batchDraw();
	};

	//roadTrip dashborad
	public attachRoadTripDashboard(view: RoadTripDashboardView): void {
        this.roadTripDashboard = view;
    }
	public resetRoadTripHud(): void {
 	   this.roadTripDashboard?.reset();
 	}
}
