// src/views/QuestionBox.ts
// 
// 
/*=============================
  VIEW LAYER:
  - Use Konva to draw a question card

==============================*/


import Konva from "konva";
import { Answer, Question } from "../models/Questions"

export class QuestionCard {
  private layer: Konva.Layer;
  private currentAnswers: Answer[] = [];

  constructor() {
    this.layer = drawQuestionCard();
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

  setQuestion(question: Question, wrongAnswers: Answer[]) {
    const answers = [question.getCorrectAnswer(), ...wrongAnswers]
    const shuffled = answers.sort(() => Math.random() - 0.5);

    const questionText = this.layer.findOne('.questionText') as Konva.Text;
    questionText.text(question.questionText);

    for (let i = 0; i < 4; i++) {
      const answerText = this.layer.findOne(`.answerText${i}`) as Konva.Text;
      answerText.text(shuffled[i].answerText);
    }

    this.layer.draw();
    this.currentAnswers = shuffled;
  }
}

export function drawQuestionCard(): Konva.Layer {
  const questionLayer = new Konva.Layer();

  // question card constants:
    // box size 
    const WIDTH_Q = 400;
    const HEIGHT_Q = 420;
    const RAD_Q = 10;
    const STROKEWIDTH = 4;

    // box positioning
    const X_Q = 550;
    const Y_Q = 200;

    // text params
    const X_T = X_Q + (WIDTH_Q / 2);
    const Y_T = Y_Q + 30;

  // answer card constants:
    // box size
    const SPACING = 30;
    const WIDTH_A = (WIDTH_Q / 2) - SPACING;
    const HEIGHT_A = 70;
    const RAD_A = 10;

    // box positioning
    const RIGHT_X_A = (X_Q + (X_Q + WIDTH_Q)) / 2;  // Get center of the question box
    const LEFT_X_A = RIGHT_X_A - WIDTH_A;
    const TOP_Y_A =  (Y_Q + HEIGHT_Q) - (2 * HEIGHT_A) - SPACING;
    const BOTTOM_Y_A = TOP_Y_A + HEIGHT_A;

    // extra constants
    const xPositions = [LEFT_X_A, RIGHT_X_A];
    const yPositions = [TOP_Y_A, BOTTOM_Y_A];
    const COLORS_A = ['#ff6767ff','#6a6cffff','#62ff6aff', '#fdf66aff'];
    const black = '#000000ff';
    const FONTSIZE_A = 25;

  // draw the main box which holds everything on the question card
  const rectQuestion = new Konva.Rect({
    x: X_Q,
    y: Y_Q,
    width: WIDTH_Q,
    height: HEIGHT_Q,
    fill: '#f5f0e0ff',
    stroke: black,
    strokeWidth: STROKEWIDTH,
    cornerRadius: RAD_Q,
    shadowEnabled: true,
    shadowBlur: 0,
    shadowOpacity: 0.5,
  });
  questionLayer.add(rectQuestion);

  const textQuestion = new Konva.Text({
    x: X_T,
    y: Y_T,
    width: WIDTH_Q - 60,
    text: 'This is the dummy text. Have you set a question?',
    fontSize: 25,
    fontStyle: "bold",
    fill: black,
    align: 'center',
    name: 'questionText'
  });
  textQuestion.offsetX(textQuestion.width() / 2);
  questionLayer.add(textQuestion);

  // draw all the answer cards
  for (let i = 0; i < 4; i++) {
    // answer card group: rect + text
    const centerX = xPositions[i % 2] + WIDTH_A / 2;
    const centerY = yPositions[Math.floor(i / 2)] + HEIGHT_A / 2;
    const group = new Konva.Group({
      name: `answerCard${i}`,
      x: centerX,
      y: centerY
    });

    // rect positioned relative to group center
    const rect = new Konva.Rect({
      x:-WIDTH_A / 2,
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
      text: `${i + 1}`,  // placeholder
      fontSize: FONTSIZE_A,
      fill: black,
      align: 'center',
      name: `answerText${i}`,
    });

    group.add(rect, text);

    // Mouse hovering
    group.on('mouseenter', () => {
      group.scale({ x: 1.05, y: 1.05 });
      group.moveToTop();
      questionLayer.draw();
      questionLayer.getStage().container().style.cursor = 'pointer';
    });

    group.on('mouseleave', () => {
      group.scale({ x: 1, y: 1 });
      questionLayer.draw();
      questionLayer.getStage().container().style.cursor = 'default';
    });

    questionLayer.add(group);
  }


  questionLayer.draw();
  return questionLayer;
}
