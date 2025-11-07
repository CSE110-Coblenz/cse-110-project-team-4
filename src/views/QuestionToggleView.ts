import Konva from "konva";
import { getDims, simpleLabelFactory } from "../utils/ViewUtils";

export interface Toggles {
    [key: string]: boolean
}

export class QuestionToggleView {
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;
    private startW: number;
    private id: string;

    // backHandler should be a handler for the back button
    // toggleHandler should be a handler for the toggle question buttons
    // saveHandler should be a handler for the save options button
    constructor(
        temphandler: () => void, 
        backHandler: () => void, 
        toggleHandler: (p: keyof Toggles) => void, 
        saveHandler: () => void, 
        stage: Konva.Stage, 
        id: string) 
    {
        this.layer = new Konva.Layer({
            visible: false
        });
        this.id = id;
        let [w, h] = getDims(360, 360, id)
        this.startW = w;
        this.toggleButtonGroup = new Konva.Group();

        const backLabel = simpleLabelFactory(w / 2, 2 * h / 12, "Go Back", backHandler); // should do something w/ screenswitcher
        const capitalToggle = simpleLabelFactory(w / 2, 3 * h / 12, "Toggle Capitals", () => toggleHandler("capitalQuestions"));
        const flowersToggle = simpleLabelFactory(w / 2, 4 * h / 12, "Toggle Flowers", () => toggleHandler("flowerQuestions"));
        const abbreviationToggle = simpleLabelFactory(w / 2, 5 * h / 12, "Toggle Abbreviations", () => toggleHandler("abbreviationQuestions"));
        const saveButton = simpleLabelFactory(w / 2, 6 * h / 12, "Save", () => saveHandler());
        const tempLabel = simpleLabelFactory(w / 2, 7 * h / 12, "Get Question", temphandler);

        const rect = new Konva.Rect({
            x: w / 4,
            y: h / 8,
            width: w / 2,
            height: 5 * h / 8,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 1
        })

        capitalToggle.width(300);
        flowersToggle.width(300);
        abbreviationToggle.width(300);

        this.init(rect, this.toggleButtonGroup);
        this.init(backLabel, this.toggleButtonGroup);
        this.init(capitalToggle, this.toggleButtonGroup);
        this.init(flowersToggle, this.toggleButtonGroup);
        this.init(abbreviationToggle, this.toggleButtonGroup);
        this.init(saveButton, this.toggleButtonGroup);
        this.init(tempLabel, this.toggleButtonGroup);

        this.layer.add(this.toggleButtonGroup);
        stage.add(this.layer);
    }
        
    private init(node: Konva.Group | Konva.Rect, group: Konva.Group) {
        node.setAttr('centerOffset', this.startW / 2 - node.getAttr('x'));
        group.add(node);
    }

    show(): void {
        this.layer.visible(true);
        this.layer.draw();
    }

    hide(): void {
        this.layer.visible(false);
        this.layer.draw();
    }

    public resize(): void {
        let [w, h] = getDims(360, 360, this.id);
        this.layer.getChildren().forEach((group) => {
            if (group instanceof Konva.Group) {
                group.getChildren().forEach(subnode => {
                    if (subnode instanceof Konva.Group) {
                        subnode.getChildren().forEach(node => {
                            node.x(Math.max(10, w / 2 ));
                        });
                    } else if (subnode instanceof Konva.Rect) {
                        subnode.x(Math.max(10, w / 2 - subnode.getAttr('centerOffset')));
                    }
                });
            }
        });
    }

    getLayer(): Konva.Layer {
        return this.layer;
    }
}