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

const HOW_TO_PLAY = "HOW TO PLAY:\n\nLorem Ipsum Dolor\n\n Sit Amet\n\nHello World\n\n\n\n\n\n\n\n\n\n\n\n\n\npadding"

const CORNER_RADIUS = 10
const ALIGN_STYLE = "center"

import Konva from "konva";
import { getDims } from "../utils/ViewUtils";

export class InfoCardView {
    private layer: Konva.Layer;
    private textGroup: Konva.Group;
    private backGroup: Konva.Group;
    private startW: number;
    private id: string;

    constructor(stage: Konva.Stage, id: string) {
        let [w, h] = getDims(360, 360, id);
        this.id = id;
        this.startW = w;
        this.layer = new Konva.Layer({ visible: false });
        this.textGroup = new Konva.Group({});
        this.backGroup = new Konva.Group({});
        let text: Konva.Text = new Konva.Text({
            x: w / 4,
            y: h / 4,
            text: HOW_TO_PLAY,
            fontSize: 20,
            fontFamily: FONT_FAMILY,
            width: w / 2,
            align: ALIGN_STYLE
        });
        let backButton: Konva.Text = new Konva.Text({
            x: w / 3.8,
            y: h / 3.8 - 100,
            text: "Go Back",
            width: 80,
            fontSize: 18,
            fontFamily: FONT_FAMILY,
            align: ALIGN_STYLE
        });
        let largeRect: Konva.Rect = new Konva.Rect({
            x: w / 4,
            y: h / 4.2 - 100,
            width: w / 2,
            height: text.height() * 1.2 + 100,
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

        this.backGroup.on("click", () => {this.hide()});
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