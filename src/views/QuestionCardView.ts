// src/views/QuestionCardView.ts
// 
// 
/*=============================
  VIEW LAYER:
  - Use Konva to define and draw a question card
  - helper functions such as view, hide, and setQuestion included

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
const X_Q = 250;
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
  private onConfirmCallback?: () => void;

  constructor() {
    this.layer = this.drawQuestionCard();
  }

  getLayer(): Konva.Layer {
    return this.layer;
  }

  hide() {
    this.layer.hide();
  }

  show() {
    this.layer.show();
  }

  setQuestion(question: Question) {
    const answers = question.getShuffledAnswers();

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

  onConfirm(callback: () => void) {
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
      confirmButton.scale({ x: 1, y: 1 });
      layer.draw();
      layer.getStage().container().style.cursor = 'default';
      circle.fill(CONFIRM_FALSE);
      this.selectedAnswerIndex = null;

      if (this.onConfirmCallback) this.onConfirmCallback();
    });

    layer.draw();
  }

}

