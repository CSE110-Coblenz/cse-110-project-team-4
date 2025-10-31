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
    let WIDTH_Q = 400;
    let HEIGHT_Q = 420;
    let RAD_Q = 10;
    let STROKEWIDTH = 4;

    // box positioning
    let X_Q = 550;
    let Y_Q = 200;

    // text params
    let X_T = X_Q + (WIDTH_Q / 2);
    let Y_T = Y_Q + 30;

  // answer card constants:
    // box size
    let WIDTH_A = (WIDTH_Q / 2) - 30;
    let HEIGHT_A = 70;
    let RAD_A = 10;

    // box positioning
    let RIGHT_X_A = (X_Q + (X_Q + WIDTH_Q)) / 2;  // Get center of the question box
    let LEFT_X_A = RIGHT_X_A - WIDTH_A;
    let TOP_Y_A =  (Y_Q + HEIGHT_Q) - (2 * HEIGHT_A) - 30;
    let BOTTOM_Y_A = TOP_Y_A + HEIGHT_A;


  // draw the main box which will contain 
  const rectQuestion = new Konva.Rect({
    x: X_Q,
    y: Y_Q,
    width: WIDTH_Q,
    height: HEIGHT_Q,
    fill: '#f5f0e0ff',
    stroke: '#000000ff',
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
    fill: 'black',
    align: 'center',
  })
  textQuestion.offsetX(textQuestion.width() / 2);
  questionLayer.add(textQuestion);

  const rectA = new Konva.Rect({
    x: LEFT_X_A, 
    y: TOP_Y_A,
    width: WIDTH_A,
    height: HEIGHT_A,
    fill: '#ff6767ff',
    stroke: '#000000ff',
    strokeWidth: STROKEWIDTH,
    cornerRadius: RAD_A
  })
  questionLayer.add(rectA);

  const rectB = new Konva.Rect({
    x: RIGHT_X_A, 
    y: TOP_Y_A,
    width: WIDTH_A,
    height: HEIGHT_A,
    fill: '#6a6cffff',
    stroke: '#000000ff',
    strokeWidth: STROKEWIDTH,
    cornerRadius: RAD_A,
  })
  questionLayer.add(rectB);

  const rectC = new Konva.Rect({
    x: LEFT_X_A,
    y: BOTTOM_Y_A,
    width: WIDTH_A,
    height: HEIGHT_A,
    fill: '#62ff6aff',
    stroke: '#000000ff',
    strokeWidth: STROKEWIDTH,
    cornerRadius: RAD_A,
  })
  questionLayer.add(rectC);
  
  const rectD = new Konva.Rect({
    x: RIGHT_X_A,
    y: BOTTOM_Y_A,
    width: WIDTH_A,
    height: HEIGHT_A,
    fill: '#fdf66aff',
    stroke: '#000000ff',
    strokeWidth: STROKEWIDTH,
    cornerRadius: RAD_A,
  })
  questionLayer.add(rectD);

  const textA = new Konva.Text({
    x: LEFT_X_A + (WIDTH_A / 2),
    y: TOP_Y_A + (HEIGHT_A / 3),
    width: WIDTH_A + 20,
    text: 'A',
    fontSize: 25,
    fill: 'black',
    align: 'center',
  })
  textA.offsetX(textA.width() / 2);
  questionLayer.add(textA);

  const textB = new Konva.Text({
    x: RIGHT_X_A + (WIDTH_A / 2),
    y: TOP_Y_A + (HEIGHT_A / 3),
    width: WIDTH_A + 20,
    text: 'B',
    fontSize: 25,
    fill: 'black',
    align: 'center',
  })
  textB.offsetX(textB.width() / 2);
  questionLayer.add(textB);

  const textC = new Konva.Text({
    x: LEFT_X_A + (WIDTH_A / 2),
    y: BOTTOM_Y_A + (HEIGHT_A / 3),
    width: WIDTH_A + 20,
    text: 'C',
    fontSize: 25,
    fill: 'black',
    align: 'center',
  })
  textC.offsetX(textC.width() / 2);
  questionLayer.add(textC);

  const textD = new Konva.Text({
    x: RIGHT_X_A + (WIDTH_A / 2),
    y: BOTTOM_Y_A + (HEIGHT_A / 3),
    width: WIDTH_A + 20,
    text: 'D',
    fontSize: 25,
    fill: 'black',
    align: 'center',
  })
  textD.offsetX(textD.width() / 2);
  questionLayer.add(textD);

  // const questionCard = new QuestionCard(question, );

  questionLayer.draw();
  return questionLayer;
}