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

const HOW_TO_PLAY: string =
"Welcome to the US Map Quiz Game, where YOU race the clock to prove how\n" +
  "much you know about the states!\n\n" +
  "1. Getting Started\n" +
  "* You’ll start on the Welcome Screen.\n" +
  "* Type in your name so the game knows who’s playing.\n" +
  "* Choose what you want to do:\n" +
  "    * Start Game\n" +
  "    * How to Play\n" +
  "    * Options (this is where you pick the kinds of questions you want)\n\n" +
  "2. Pick Your Question Types\n" +
  "Head to Options to choose what you want to be quizzed on:\n" +
  "* Capitals (ex: “What’s the capital of California?”)\n" +
  "* Abbreviations (ex: “What’s CA stand for?”)\n" +
  "* State Flowers (Yep, every state has one!)\n" +
  "Make sure you hit Save! If you don’t pick anything, the game will default to capital questions.\n\n" +
  "3. Gameplay Basics\n" +
  "Input your name and hit Start Game, and you’ll jump into the US map!\n" +
  "Timer\n" +
  "You get 15 minutes to play. When the time’s up, game over.\n" +
  "How it works\n" +
  "1. Click a state on the map.\n" +
  "2. A question pops up with four choices.\n" +
  "3. Pick your answer, and click OK to lock it in.\n" +
  "Scoring\n" +
  "* Correct? +10 points and the state turns green.\n" +
  "* Wrong? The state turns red (and you can only get 3 wrong answers before the game ends!).\n\n" +
  "4. When the Game Ends\n" +
  "The game stops when:\n" +
  "* You get all 50 states correct, OR\n" +
  "* The timer hits zero, OR\n" +
  "* You hit 3 incorrect answers.\n" +
  "You’ll then see the Leaderboard, showing your results.\n" +
  "Want another round? Hit Restart Game to reset everything and try again!\n\n" +
  "Ready? Let’s see how well YOU know the USA!";

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
            align: ALIGN_STYLE,
            lineHeight: 1.08,
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

        //top padding
        const topPadding = 20;
        // bottom padding below text
        const bottomPadding = 20;
        // calculate rect height
        const calculatedHeight = topPadding + text.height() + bottomPadding;

        let largeRect: Konva.Rect = new Konva.Rect({
            x: w / 4,
            y: (h / 2) - (calculatedHeight / 2), // center vertically
            width: w / 2,
            height: calculatedHeight,
            cornerRadius: CORNER_RADIUS,
            fill: BOX_BG,
            stroke: STROKE_COLOR
        });

        text.y(largeRect.y() + topPadding);
        text.x(largeRect.x() + topPadding);
        text.width(largeRect.width() - topPadding * 2);

        const buttonPadding = 15;
        backButton.x(largeRect.x() + largeRect.width() - backButton.width() - buttonPadding);
        backButton.y(largeRect.y() + buttonPadding);

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
