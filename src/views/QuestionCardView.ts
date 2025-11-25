// src/views/QuestionCardView.ts
/*=============================
  VIEW LAYER:
  - Use Konva to define and draw a question card.
  - Manages answer selection state and visual feedback.
  - Implements "Global Scaling" to ensure the card fits any screen size.

  Sprint 3 updates (Nov 2025):
  - Added global scaling logic via resize().
  - Constructor now requires Konva.Stage to calculate responsive dimensions.
  - Implemented ResizeObserver pattern (via main window listener) for auto-scaling.

  Public API:
  + constructor(stage: Konva.Stage)
  + show(): void
  + hide(): void
  + setQuestion(question: Question): void
  + onConfirm(callback: (correct: boolean) => void): void
  + resize(): void  <-- New core method for responsive layout
  + getLayer(): Konva.Layer

  History:
  Sprint 2 updates (Nov 2025):
  - Added onConfirm() callback registration for UIController integration
  - Callback fires on confirm button click to enable stats/feedback updates
==============================*/

import Konva from "konva";
import { Answer, Question } from "../models/Questions"

// question card constants:
// box size 
const WIDTH_Q = 400;
const HEIGHT_Q = 420;
const RAD_Q = 10;
const STROKEWIDTH = 3;

// box positioning
const X_Q = 435;
const Y_Q = 50;

// text params
const X_T = X_Q + (WIDTH_Q / 2);
const Y_T = Y_Q + 30;

// answer card constants:
// box size
const HORIZONTAL_SPACING = 35;
const VERTICAL_SPACING = 50;
const WIDTH_A = (WIDTH_Q / 2) - HORIZONTAL_SPACING;
const HEIGHT_A = 70;
const RAD_A = 10;

// box positioning
const RIGHT_X_A = (X_Q + (X_Q + WIDTH_Q)) / 2;  // Get center of the question box
const LEFT_X_A = RIGHT_X_A - WIDTH_A;
const TOP_Y_A = (Y_Q + HEIGHT_Q) - (2 * HEIGHT_A) - VERTICAL_SPACING;
const BOTTOM_Y_A = TOP_Y_A + HEIGHT_A;
const xPositions = [LEFT_X_A, RIGHT_X_A];
const yPositions = [TOP_Y_A, BOTTOM_Y_A];

// colors and fontsize
const COLOR_Q = '#f5f0e0d5';
const COLORS_A = ['#ff6767ff', '#6a6cffff', '#62ff6aff', '#fdf66aff'];
const black = '#000000ff';
const CONFIRM_TRUE = '#ffffffff';
const CONFIRM_FALSE = '#585858ff';
const FONTSIZE_A = 25;

export class QuestionCardView {
  private layer: Konva.Layer;
  private currentAnswers: Answer[] = [];
  private selectedAnswerIndex: number | null = null;
  private onConfirmCallback?: (correct: boolean) => void;
  private correctIndex: number;

  // [new 11/23 Dennis] 
  private stage: Konva.Stage;

  constructor(stage: Konva.Stage){
    this.stage = stage;
    this.layer = this.drawQuestionCard();
    this.correctIndex = -1;
    // [new 11/23 Dennis] Listen for window size changes and trigger scaling.
    // Use requestAnimationFrame to avoid frequent triggering
    window.addEventListener('resize', () => {
        this.resize();
    });
    
    // Execute once during initialization
    this.resize();
  }

  //[new 11/23 Dennis]
  public resize() {
    if (!this.stage || this.stage.width() === 0) return;
    const w = this.stage.width();
    const h = this.stage.height();
    
    // 1. Define the "safe zone" of the original answer sheet design
    // Based on constants: the card is approximately 400 wide and 420 high. 
    // With the confirmation button and shadow, it will occupy approximately 500x550 space.
    // The origin is around (450, 260) (250+200, 50+210).
    const DESIGN_W = 450;
    const DESIGN_H = 600;
    
    // 2. Calculate the scaling ratio: Fit the card to the screen, 
    // but do not exceed its original size (1.0).
    // 0.85 leaving some margin.
    let scale = Math.min(
        (w / DESIGN_W) * 0.9, 
        (h / DESIGN_H) * 0.85
    );
    
    // 3. apply change
    // Set the origin as the geometric center of the card (based on an estimated value of the original constant).
    this.layer.offset({ x: 450, y: 260 }); 
    this.layer.position({ x: w / 2, y: h / 2 }); // Move to the center of the screen
    this.layer.scale({ x: scale, y: scale });
    
    this.layer.batchDraw();
  }

  getLayer(): Konva.Layer {
    return this.layer;
  }

  hide() {
    this.layer.hide();
  }

  show() {
    this.layer.show();
    this.resize();
  }

  setQuestion(question: Question) {
    const [answers, idx] = question.getShuffledAnswers();
    this.correctIndex = idx;

    // update the question
    const questionText = this.layer.findOne(`.question-text`) as Konva.Text;
    questionText.text(question.questionText);

    // update answers
    for (let i = 0; i < 4; i++) {
      const answerText = this.layer.findOne(`.answer-text-${i}`) as Konva.Text;
      answerText.text(answers[i].answerText);
    }

    // redraw and update parameters
    this.layer.draw();
    this.currentAnswers = answers;

  }

  onConfirm(callback: (correct: boolean) => void) {
    this.onConfirmCallback = callback;
  }

  private drawQuestionCard(): Konva.Layer {
    const questionLayer = new Konva.Layer();

    // draw the main box which holds everything on the question card
    this.drawMainCard(questionLayer);

    // draw all the answer cards
    for (let i = 0; i < 4; i++) {
      // draw the answer card (group: rect + text)
      this.drawAnswerCard(questionLayer, i);
    }

    // draw the confirm button (group: circle + text)
    this.drawConfirmButton(questionLayer);

    return questionLayer;
  }


  private drawMainCard(layer: Konva.Layer): void {
    // draw the main card which holds everything on the question card
    const rect = new Konva.Rect({
      x: X_Q,
      y: Y_Q,
      width: WIDTH_Q,
      height: HEIGHT_Q,
      fill: COLOR_Q,
      stroke: black,
      strokeWidth: STROKEWIDTH,
      cornerRadius: RAD_Q,
      shadowEnabled: true,
      shadowBlur: 0,
      shadowOpacity: 0.5,
    });

    const text = new Konva.Text({
      x: X_T,
      y: Y_T,
      width: WIDTH_Q - 60,
      text: 'This is the dummy text. Have you set a question?',
      fontSize: 25,
      fontStyle: "bold",
      fill: black,
      align: 'center',
      name: 'question-text'
    });
    text.offsetX(text.width() / 2);

    layer.add(rect, text);
  }

  private drawAnswerCard(layer: Konva.Layer, i: number): void {
    // answer card group: rect + text
    const centerX = xPositions[i % 2] + WIDTH_A / 2;
    const centerY = yPositions[Math.floor(i / 2)] + HEIGHT_A / 2;
    const group = new Konva.Group({
      name: `answer-card-${i}`,
      x: centerX,
      y: centerY
    });

    const rect = new Konva.Rect({
      x: -WIDTH_A / 2,
      y: -HEIGHT_A / 2,
      width: WIDTH_A,
      height: HEIGHT_A,
      fill: COLORS_A[i],
      stroke: black,
      strokeWidth: STROKEWIDTH,
      cornerRadius: RAD_A,
    });

    const text = new Konva.Text({
      x: -WIDTH_A / 2,
      y: -HEIGHT_A / 2 + HEIGHT_A / 3,
      width: WIDTH_A,
      text: `${i + 1}`,           // just a placeholder
      fontSize: FONTSIZE_A,
      fill: black,
      align: 'center',
      name: `answer-text-${i}`,
    });

    group.add(rect, text);

    // Mouse hovering
    group.on('mouseenter', () => {
      group.scale({ x: 1.05, y: 1.05 });
      group.moveToTop();
      layer.draw();
      layer.getStage().container().style.cursor = 'pointer';
    });
    group.on('mouseleave', () => {
      group.scale({ x: 1, y: 1 });
      layer.draw();
      layer.getStage().container().style.cursor = 'default';
    });

    // update selected answer and confirm button functionality on click
    group.on('click', () => {
      this.selectedAnswerIndex = i;

      group.scale({ x: 1, y: 1 });

      const confirmCircle = layer.findOne('.confirm-circle') as Konva.Circle;
      confirmCircle.fill(CONFIRM_TRUE);
      layer.draw();
    });

    layer.add(group);
  }

  private drawConfirmButton(layer: Konva.Layer): void {
    const confirmButton = new Konva.Group({
      name: 'confirm-button',
      x: RIGHT_X_A,
      y: BOTTOM_Y_A + 2.2 * VERTICAL_SPACING
    });

    const circle = new Konva.Circle({
      name: 'confirm-circle',
      x: 0,
      y: 0,
      radius: 30,
      fill: CONFIRM_FALSE,
      stroke: black,
      strokeWidth: STROKEWIDTH,
    });

    const ok = new Konva.Text({
      x: -25,
      y: -10,
      width: 50,
      height: 15,
      text: 'OK',
      fontSize: 20,
      fontStyle: "bold",
      fill: black,
      align: 'center',
    });

    confirmButton.add(circle, ok);
    layer.add(confirmButton);

    // Mouse hovering
    confirmButton.on('mouseenter', () => {
      if (this.selectedAnswerIndex === null) return;

      confirmButton.scale({ x: 1.10, y: 1.10 });
      confirmButton.moveToTop();
      layer.draw();
      layer.getStage().container().style.cursor = 'pointer';
    });
    confirmButton.on('mouseleave', () => {
      confirmButton.scale({ x: 1, y: 1 });
      layer.draw();
      layer.getStage().container().style.cursor = 'default';

    });
    confirmButton.on('click', () => {
      if (this.selectedAnswerIndex === null) {
        // Don't allow confirmation without selecting an answer
        return;
      }
      confirmButton.scale({ x: 1, y: 1 });
      layer.draw();
      layer.getStage().container().style.cursor = 'default';
      circle.fill(CONFIRM_FALSE);
      if (this.onConfirmCallback) this.onConfirmCallback(this.selectedAnswerIndex === this.correctIndex);
      this.selectedAnswerIndex = null;
    });

    layer.draw();
  }

}

