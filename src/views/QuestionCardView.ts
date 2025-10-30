// src/views/QuestionBox.ts
// 
// 
/*=============================
  VIEW LAYER:
  TODO: add description here
  - 

==============================*/
// Use Konva to draw a question card/box

import Konva from "konva";
// import { MCQ, MCQStatus } from "../models/Question";
import MapViewSquares, { MapViewSquaresOptions } from "./MapViewSquares";


export default function askQuestion() {
  const stage = new Konva.Stage({
    container: 'map-container', // id of container <div>
    width: 1280,
    height: 780
  });

  const questionLayer = new Konva.Layer();
  stage.add(questionLayer);

  const questionBox = new Konva.Rect({
    x: 640,
    y: 300,
    width: 300,
    height: 250,
    fill: '#edf5b2ff',
    stroke: 'black',
    strokeWidth: 4,
    cornerRadius: 10
  });

  questionLayer.add(questionBox);
  questionLayer.draw();

}