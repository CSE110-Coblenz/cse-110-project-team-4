// src/views/QuestionBox.ts
// 
// 
/*=============================
  VIEW LAYER:
  - Use Konva to draw a question card

==============================*/


import Konva from "konva";
// import { MCQ, MCQStatus } from "../models/Question";
import { Question } from "../models/Question"

export function drawQuestionCard(question: Question): Konva.Layer {
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
    const WIDTH_A = (WIDTH_Q / 2) - 30;
    const HEIGHT_A = 70;
    const RAD_A = 10;

    // box positioning
    const RIGHT_X_A = (X_Q + (X_Q + WIDTH_Q)) / 2;  // Get center of the question box
    const LEFT_X_A = RIGHT_X_A - WIDTH_A;
    const TOP_Y_A =  (Y_Q + HEIGHT_Q) - (2 * HEIGHT_A) - 30;
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
  });
  questionLayer.add(rectQuestion);

  const textQuestion = new Konva.Text({
    x: X_T,
    y: Y_T,
    width: WIDTH_Q - 60,
    text: 'What is the capital of California? (dummy text)',
    fontSize: 25,
    fill: black,
    align: 'center',
  })
  textQuestion.offsetX(textQuestion.width() / 2);
  questionLayer.add(textQuestion);

  // draw all the answer cards
  for (let i = 0; i <= 3; i++) {
    const rect = new Konva.Rect({
      x: xPositions[i % 2],
      y: yPositions[Math.floor(i / 2)],
      width: WIDTH_A,
      height: HEIGHT_A,
      fill: COLORS_A[i],
      stroke: black,
      strokeWidth: STROKEWIDTH,
      cornerRadius: RAD_A
    })

    const text = new Konva.Text({
      x: xPositions[i % 2] + (WIDTH_A / 2),
      y: yPositions[Math.floor(i / 2)] + (HEIGHT_A / 3),
      width: WIDTH_A + 20,
      text: `${i + 1}`,                 // DUMMY ANSWERS, TO BE REPLACED.
      fontSize: FONTSIZE_A,
      fill: black,
      align: 'center',
      name: `answer${i + 1}`
    })
    text.offsetX(text.width() / 2);

    const group = new Konva.Group({
      name: `answerCard${i + 1}`
    })

    group.add(rect, text);
    questionLayer.add(group);
  }

  // add 
  const answerCardBucket = new Konva.Group({
    name: 'answerCardBucket'
  })
  // answerCardBucket.add(answerCard1, answerCard2, answerCard3, answerCard4);

  questionLayer.draw();
  return questionLayer;
}