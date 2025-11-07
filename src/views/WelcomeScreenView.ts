import Konva from "konva";
import { getDims, simpleLabelFactory } from "../utils/ViewUtils";

export class WelcomeScreenView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;
    private id: string;
    private startW: number;
    private inputEl;

    // backHandler should be a handler for the back button
    // toggleHandler should be a handler for the toggle question buttons
    // saveHandler should be a handler for the save options button
    constructor(
        startHandler: () => void, 
        infoHandler: () => void, 
        optionsHandler: () => void, 
        id: string) 
    {
        this.id = id;
        let [w, h] = getDims(360, 360, id);
        this.startW = w;
        this.stage = new Konva.Stage({
            container: id,
            width: w,
            height: h,
            visible: false
        })
        // I think we should eventually have a standardized getDimensions method if we want to avoid repeating
        // code to deal with dynamic resizing...

        this.layer = new Konva.Layer({ visible: true });
        this.toggleButtonGroup = new Konva.Group();

        const startLabel = simpleLabelFactory(w / 2, h / 4, "Start Game", startHandler);
        const infoLabel = simpleLabelFactory(w / 2, h / 4 + 200, "How To Play", infoHandler);
        const optionsLabel = simpleLabelFactory(w / 2, h / 4 + 300, "Options", optionsHandler);

        let menuEl = document.getElementById(id);
        const textBox = document.createElement("textarea");
        textBox.id = "nameInput";
        textBox.style.top = h / 4 + 100 + "px";
        textBox.style.width = "200px";
        textBox.style.left = (w / 2 - 100) + "px";
        textBox.style.position = "absolute";
        textBox.style.zIndex = "1";
        this.inputEl = textBox;
        menuEl?.appendChild(textBox);

        this.init(startLabel, this.toggleButtonGroup);
        this.init(infoLabel, this.toggleButtonGroup);
        this.init(optionsLabel, this.toggleButtonGroup);

        this.layer.add(this.toggleButtonGroup);
        this.stage.add(this.layer);
    }
    
    private init(node: Konva.Group, group: Konva.Group) {
        node.setAttr('centerOffset', this.startW / 2 - node.getAttr('x'));
        group.add(node);
    }

    show(): void {
        this.stage.visible(true);
        document.getElementById(this.id)!.style.display = "block";
        this.inputEl.style.display = "block";
        this.stage.draw();
    }

    hide(): void {
        this.stage.visible(false);
        document.getElementById(this.id)!.style.display = "none";
        this.inputEl.style.display = "none";
        this.stage.draw();
    }

    getLayer(): Konva.Layer {
        return this.layer;
    }

    getStage(): Konva.Stage {
        return this.stage;
    }

    getInput() {
        return this.inputEl;
    }

    public resize(): void {
        let [w, h] = getDims(360, 360, this.id);
        this.layer.getChildren().forEach((group) => {
            if (group instanceof Konva.Group) {
                group.getChildren().forEach(subgroup => {
                    if (subgroup instanceof Konva.Group) {
                        subgroup.getChildren().forEach(node => {
                            node.x(Math.max(10, w / 2 ));
                        });
                    }
                });
            }
        });
        this.inputEl.style.left = (w / 2 - 100) + "px";
    }
}