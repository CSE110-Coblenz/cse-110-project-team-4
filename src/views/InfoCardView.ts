// src/views/InfoCardView.ts
/*==============================================================================
InfoCardView

Public API
- constructor(stage: Konva.Stage, id: string)
- show()
- hide()
- getLayer()
- resize()

Konva Elements
- layer: layer that holds groups only for the welcome screen, to be added to WelcomeScreen stage
- textGroup: group that holds the main text and its bounding box
- backGroup: group that holds the back button and its bounding box

Related
- Controller: src/controllers/WelcomeScreenController.ts
==============================================================================*/

const BOX_BG = "#eee"
const BACK_BG = "#daafafff"
const STROKE_COLOR = "black"
const FONT_FAMILY = "Arial"

const HOW_TO_PLAY = `Welcome to the US Map Quiz Game, where YOU race the clock to prove how much you know about the states!

1. Getting Started
* Type in your name so the game knows who’s playing.
* Choose what you want to do: Start Game, How to Play, or Options (this is where you pick the kinds of questions you want)

2. Pick Your Question Types: Head to Options to choose what you want to be quizzed on:
* Capitals (like “What’s the capital of California?”)
* Abbreviations (“What’s CA stand for?”)
* State Flowers (yep, every state has one!)
Make sure you hit Save! If you don’t pick anything, the game will default to capital questions.

3. Gameplay Basics
Hit Start Game, and you’ll jump into the US map! You get 15 minutes to play. When time’s up, game over.

How it works:
1.A question pops up with four choices.
2. Pick your answer → click OK to lock it in.

Scoring
* Correct? +10 points and the state turns green.
* Wrong? The state turns red (and you can only get 3 wrong before the game ends!).

4. When the Game Ends
The game stops when:
* You get all 50 states correct, OR The timer hits zero, OR You hit 3 incorrect answers.

You’ll then see the Leaderboard, showing your results!
Want another round? Hit Restart Game to reset everything and try again!

Ready? Let’s see how well YOU know the USA! 🇺🇸🧠✨`;

const CORNER_RADIUS = 10
const ALIGN_STYLE = "left"

import Konva from "konva";
import { getDims } from "../utils/ViewUtils";

export class InfoCardView {
    private layer: Konva.Layer;
    private textGroup: Konva.Group;
    private backGroup: Konva.Group;
    private startW: number;
    private id: string;

    constructor(stage: Konva.Stage, id: string, hide: () => void) {
        let [w, h] = getDims(360, 360, id);
        this.id = id;
        this.startW = w;
        this.layer = new Konva.Layer({ visible: false });
        this.textGroup = new Konva.Group({});
        this.backGroup = new Konva.Group({});
        let text: Konva.Text = new Konva.Text({
            x: w / 4 + 20,
            y: h / 4 + 20,
            text: HOW_TO_PLAY,
            fontSize: 20,
            fontFamily: FONT_FAMILY,
            width: w / 2 - 40,
            align: ALIGN_STYLE
        });
        let backButton: Konva.Text = new Konva.Text({
            x: w / 3.8,
            y: h / 3.8 - 50,
            text: "Go Back",
            width: 80,
            fontSize: 18,
            fontFamily: FONT_FAMILY,
            align: ALIGN_STYLE
        });
        let largeRect: Konva.Rect = new Konva.Rect({
            x: w / 4,
            y: h / 4.2,
            width: w / 2,
            height: text.height() * 14,
            cornerRadius: CORNER_RADIUS,
            fill: BOX_BG,
            stroke: STROKE_COLOR
        });
        let smallRect: Konva.Rect = new Konva.Rect({
            x: backButton.x() - 5,
            y: backButton.y() - 5,
            width: backButton.width() + 10,
            height: backButton.height() + 10,
            cornerRadius: CORNER_RADIUS,
            fill: BACK_BG,
            stroke: STROKE_COLOR
        });

        this.backGroup.on("click", hide);
        this.backGroup.on('mouseover', function (e) {
            e.target.getStage()!.container().style.cursor = 'pointer';
        });
        this.backGroup.on('mouseout', function (e) {
            e.target.getStage()!.container().style.cursor = 'default';
        });

        this.init(largeRect, this.textGroup);
        this.init(smallRect, this.backGroup);
        this.init(text, this.textGroup);
        this.init(backButton, this.backGroup);
        this.layer.add(this.textGroup);
        this.layer.add(this.backGroup);
        stage.add(this.layer);
    }

    private init(node: Konva.Text | Konva.Rect, group: Konva.Group) {
        node.setAttr('centerOffset', this.startW / 2 - node.getAttr('x'));
        group.add(node);
    }

    public show(): void {
        this.layer.visible(true);
        this.layer.draw();
    }
    
    public hide(): void {
        this.layer.visible(false);
        this.layer.draw();
    }

    public getLayer() {
        return this.layer;
    }

    public resize(): void {
        let [w, h] = getDims(360, 360, this.id);
        this.layer.getChildren().forEach((group) => {
            if (group instanceof Konva.Group) {
                group.getChildren().forEach(node => {
                    node.x(Math.max(10, w / 2 - node.getAttr('centerOffset')));
                });
            }
        });
    }
}