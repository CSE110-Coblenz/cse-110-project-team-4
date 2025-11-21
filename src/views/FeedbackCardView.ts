// src/views/FeedbackCardView.ts
/*=============================

Public API:
- constructor(stage: Konva.Stage, overlay: OverlayLayer)
- show(correct: boolean)
- hide()

Konva Elements
- feedbackGroup: Konva.Group - holds feedback card
==============================================================================*/

import Konva from "konva"
import { OverlayLayer } from "./OverlayLayer";
import { QuestionCardView } from "./QuestionCardView";

const FILL_CORRECT = '#43A047';
const STROKE_CORRECT = '#2E7D32';
const TEXT_CORRECT = 'CORRECT!'

const FILL_WRONG = '#be1a1aff'
const STROKE_WRONG = '#841313ff'
const TEXT_WRONG = 'INCORRECT'

const WIDTH = 300;
const HEIGHT = 100;

export class FeedbackCardView {
    private feedbackGroup: Konva.Group;

    constructor(stage: Konva.Stage, overlay: OverlayLayer) {
		this.feedbackGroup = new Konva.Group({
			x: stage.width() / 2,
			y: stage.height() / 2.65,
			visible: false
		});

		this.feedbackGroup = new Konva.Group({
			x: stage.width() / 2,
			y: stage.height() / 2.65,
			visible: false
		});
		
		const feedbackRect = new Konva.Rect({
			width: WIDTH,
			height: HEIGHT,
			fill: FILL_CORRECT, 
			stroke: STROKE_CORRECT,  
			strokeWidth: 4,
			cornerRadius: 10,
			offsetX: WIDTH / 2,  
			offsetY: HEIGHT / 2
		});
		
		const feedbackText = new Konva.Text({
			width: WIDTH,
			height: HEIGHT,
			text: TEXT_CORRECT,
			fontSize: 36,
			fontStyle: 'bold',
			fill: 'white',
			align: 'center',
			verticalAlign: 'middle',
			offsetX: WIDTH / 2,
			offsetY: HEIGHT / 2
		});
		
		this.feedbackGroup.add(feedbackRect, feedbackText);
        overlay.getLayer().add(this.feedbackGroup);
    }

    show(correct: boolean, card: QuestionCardView) {
        let text, fill, stroke
        if (correct) {
            text = TEXT_CORRECT
            fill = FILL_CORRECT
            stroke = STROKE_CORRECT
        } else {
            text = TEXT_WRONG
            fill = FILL_WRONG
            stroke = STROKE_WRONG
        }

        let children = this.feedbackGroup.getChildren((child) => {return true})
        children.forEach(node => {
            if (node instanceof Konva.Text) {
                node.text(text)
            }
            if (node instanceof Konva.Rect) {
                node.fill(fill)
                node.stroke(stroke)
            }
        })
        this.feedbackGroup.moveTo(card.getLayer());
        this.feedbackGroup.visible(true);
        this.feedbackGroup.moveToTop();
        card.getLayer().batchDraw();
    }

    hide() {
        this.feedbackGroup.visible(false);
    }
}