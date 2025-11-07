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
            text: "HOW TO PLAY:\n\nLorem Ipsum Dolor\n\n Sit Amet\n\nHello World\n\n\n\n\n\n\n\n\n\n\n\n\n\npadding",
            fontSize: 20,
            fontFamily: "Arial",
            width: w / 2,
            align: 'center'
        });
        let backButton: Konva.Text = new Konva.Text({
            x: w / 3.8,
            y: h / 3.8 - 100,
            text: "Go Back",
            width: 80,
            fontSize: 18,
            fontFamily: "Aria",
            align: 'center'
        });
        let largeRect: Konva.Rect = new Konva.Rect({
            x: w / 4,
            y: h / 4.2 - 100,
            width: w / 2,
            height: text.height() * 1.2 + 100,
            cornerRadius: 10,
            fill: "#eee",
            stroke: "black"
        });
        let smallRect: Konva.Rect = new Konva.Rect({
            x: backButton.x() - 5,
            y: backButton.y() - 5,
            width: backButton.width() + 10,
            height: backButton.height() + 10,
            cornerRadius: 10,
            fill: "#daafafff",
            stroke: "black"
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