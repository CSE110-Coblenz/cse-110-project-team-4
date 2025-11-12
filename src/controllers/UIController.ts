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
  + mount(stage: Konva.Stage): void
  + goToQuestionsFor(state: USState): void
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

interface SimpleQuestion {
	questionText: string;
	getShuffledAnswers: () => Array<{ answerText: string; status: number }>;
}

const FILL_CORRECT = '#43A047';
const STROKE_CORRECT = '#2E7D32';
const TEXT_CORRECT = 'CORRECT!!!'

const FILL_WRONG = '#be1a1aff'
const STROKE_WRONG = '#841313ff'
const TEXT_WRONG = 'INCORRECT'


export class UIController {
	private stage!: Konva.Stage;
	private card!: QuestionCardView;
	private overlay!: OverlayLayer; 

	constructor(private mapController: MapController) {}

	public mount(stage: Konva.Stage) {
		this.stage = stage;

		//create mask layer
		this.overlay = new OverlayLayer({
			stage: this.stage,
			onBackdropClick: () => this.closeQuestion(),
		});
		this.overlay.mount();

		this.card = new QuestionCardView();
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
	private statsController!: GameStatsController;
	private currentPoints: number = 0;
	private feedbackGroup!: Konva.Group;
	private manager!: QuizManager;

	public goToQuestionsFor(state: USState) {
		console.log(`Opening question for state: ${state.code}`);
        
        const mockQuestion = {
            questionText: `What is the capital of ${state.code}?`,
            getShuffledAnswers: () => [
                { answerText: "Answer A", status: 0 },
                { answerText: "Answer B", status: 0 },
                { answerText: "Answer C", status: 0 },
                { answerText: "Answer D", status: 0 }
            ]
        };
        this.openQuestion(mockQuestion);
		location.hash = `#questions/${state.code}`; 
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
