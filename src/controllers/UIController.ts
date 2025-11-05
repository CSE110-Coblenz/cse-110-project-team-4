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
import { MapController } from "./MapController";
import { QuestionCardView } from "../views/QuestionCardView";


export class UIController {
	private stage!: Konva.Stage;
	private overlayLayer!: Konva.Layer;
	private backdrop!: Konva.Rect;
	private card!: QuestionCardView;

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

	constructor(private mapController: MapController) {}

	public init(stage: Konva.Stage) {
		this.stage = stage;
		this.overlayLayer = new Konva.Layer({ listening: true, visible: false });

		const vp = { x: 0, y: 0, width: stage.width(), height: stage.height() };

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
