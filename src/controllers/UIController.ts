// src/controllers/UIController.ts
/*=============================
  UI BUS / NAV LAYER:
  Minimal UI facade for frist demos.
    Logs navigation intent (visual panel)
    Updates location hash (observable effect for tests)
==============================*/
// A minimal UI bus,just for test: only one method to navigate to the Questions screen.
// Later replace this with a real router / ScreenSwitcher.
import Konva from "konva";
import { USState } from "../models/State";
import { StateStatus } from "../models/State";
import { MapController } from "./MapController";
import { QuestionCardView } from "../views/QuestionCardView";
import { GameStatsController } from "./GameStatsController";


export class UIController {
	private stage!: Konva.Stage;
	private overlayLayer!: Konva.Layer;
	private backdrop!: Konva.Rect;
	private card!: QuestionCardView;
	private statsController!: GameStatsController;
	private currentPoints: number = 0;
	private feedbackGroup!: Konva.Group;

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

	constructor(private mapController: MapController, statsController: GameStatsController) {
		this.statsController = statsController;
	}


	public init(stage: Konva.Stage) {
		this.stage = stage;
		this.overlayLayer = new Konva.Layer({ listening: true, visible: false });

		const vp = { x: 0, y: 0, width: stage.width(), height: stage.height() };

		// creating feedback popup
		this.feedbackGroup = new Konva.Group({
			x: stage.width() / 2,
			y: stage.height() / 2,
			visible: false
		});
		
		const feedbackRect = new Konva.Rect({
			width: 300,
			height: 100,
			fill: '#43A047',  // green
			stroke: '#2E7D32',  // darker green
			strokeWidth: 4,
			cornerRadius: 10,
			offsetX: 150,  // center horizontally
			offsetY: 50    // center vertically
		});
		
		const feedbackText = new Konva.Text({
			width: 300,
			height: 100,
			text: 'CORRECT!!!',
			fontSize: 36,
			fontStyle: 'bold',
			fill: 'white',
			align: 'center',
			verticalAlign: 'middle',
			offsetX: 150,
			offsetY: 50
		});
		
		this.feedbackGroup.add(feedbackRect, feedbackText);
		this.overlayLayer.add(this.feedbackGroup);

		// A mask for the question window to avoid outside event.
		// should be move to the questioncardViews.
/* 		this.backdrop = new Konva.Rect({
			x: vp.x,
			y: vp.y,
			width: vp.width,
			height: vp.height,
			fill: "rgba(0,0,0,0.25)",
			listening: true,
		});
		this.backdrop.on("click", () => this.closeQuestion()); 
		this.overlayLayer.add(this.backdrop);*/

		this.card = new QuestionCardView();
		this.card.getLayer().visible(false);

		this.card.onConfirm(() => {
			this.feedbackGroup.moveTo(this.card.getLayer());
			this.feedbackGroup.visible(true);
			this.feedbackGroup.moveToTop();
			this.card.getLayer().batchDraw();

			if (this.mapController && this.mapController.getSelectedState) {
				const currentState = this.mapController.getSelectedState?.();
				if (currentState) {
					this.statsController.onCorrect(currentState.code);
				}
			}			
			
			setTimeout(() => {
				this.feedbackGroup.visible(false);
				this.closeQuestion();
			}, 1000);
		});

		stage.add(this.overlayLayer);
		stage.add(this.card.getLayer());
		this.overlayLayer.moveToTop();
		this.card.getLayer().moveToTop();
		stage.draw();
  	}

	// public API called when a state is clicked or quiz begins
	public openQuestion(q: any) {
		if (!this.overlayLayer || !this.card) return;
		this.mapController.setInteractive(false);
		if (q) this.card.setQuestion(q as any);
		this.overlayLayer.visible(true);
		this.card.getLayer().visible(true);
		this.overlayLayer.moveToTop();
		this.card.getLayer().moveToTop();
		this.stage.batchDraw();
	}

	public closeQuestion() {
		if (!this.overlayLayer || !this.card) return;
		this.overlayLayer.visible(false);
		this.card.getLayer().visible(false);
		this.mapController.setInteractive(true);
		this.stage.batchDraw();   
	}
}
