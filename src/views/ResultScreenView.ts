import Konva from "konva";
import { getDims, simpleLabelFactory } from "../utils/ViewUtils";

export class ResultScreenView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private restartGroup: Konva.Group;
    private id: string;

    constructor(restartHandler: () => void, id: string) {
        let [w, h] = getDims(360, 360, id);
        this.stage = new Konva.Stage({
            container: id, 
            width: w,
            height: h,
            visible: false 
        });
        this.layer = new Konva.Layer({});
        this.restartGroup = new Konva.Group({});
        this.id = id;
        
        const restartLabel = simpleLabelFactory(w / 2, h / 4, "Restart Game", restartHandler);
        this.restartGroup.add(restartLabel);

        this.layer.add(this.restartGroup);
        this.stage.add(this.layer);
        this.stage.draw()
    }

    getLayer() {
        return this.layer;
    }

    getStage() {
        return this.stage;
    }

    show() {
        this.stage.visible(true);
        document.getElementById(this.id)!.style.display = "block";
        this.stage.draw();
    }

    hide() {
        this.stage.visible(true);
        document.getElementById(this.id)!.style.display = "none";
        this.stage.draw();
    }

    resize() {
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
    }
}