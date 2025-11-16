// src/controllers/UIController.ts
/*=============================
  UI BUS / NAV LAYER:
  Minimal UI facade for frist demos.
    Logs navigation intent (visual panel)
    Updates location hash (observable effect for tests)

A minimal UI bus,just for test: only one method to navigate to the Questions screen.
Later replace this with a real router / ScreenSwitcher.

API:
  + constructor(mapController: MapController)
  + mount(stage: Konva.Stage, manager: QuizManager): void
  + goToQuestionsFor(state: USState): void
  + answerResponse(correct: boolean)
  + openQuestion(q: SimpleQuestion): void
  + closeQuestion(): void
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

export class UIController {
	private stage!: Konva.Stage;
	private card!: QuestionCardView;
	private overlay!: OverlayLayer; 
	private statsController!: GameStatsController;
	private manager!: QuizManager;
	private currentState: USState | null;
	private feedback?: FeedbackCardView;

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

		this.card = new QuestionCardView();
		this.feedback = new FeedbackCardView(stage, this.overlay);

		this.card.onConfirm((correct: boolean) => {this.answerResponse(correct)});

		this.card.getLayer().visible(false);
		this.stage.add(this.card.getLayer());

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
		location.hash = `#questions/${state.code}`; 
	}

	public answerResponse(correct: boolean) {
		this.feedback?.show(correct, this.card);

		if (this.mapController && this.currentState && this.mapController.getSelectedState) {
			const currentState = this.mapController.getSelectedState?.(); // use for diff mode later?
			if (correct) {
				this.statsController.onCorrect(this.currentState.code);
			} else {
				this.statsController.onIncorrect(this.currentState.code);
			}
		}			

		setTimeout(() => {
			this.feedback?.hide();
			this.closeQuestion();
			setTimeout(() => {this.manager.handleNextAction()}, 1000);
		}, 1000)
	}

	// public API called when a state is clicked or quiz begins
	public openQuestion(q: any) {
		if (!this.overlay || !this.card) return;

		this.mapController.setInteractive(false);
		if (q) this.card.setQuestion(q as any);

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
}
