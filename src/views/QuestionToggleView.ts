import Konva from "konva";

export interface Toggles {
    [key: string]: boolean
}

export class QuestionToggleView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;
    private id: string;

    // backHandler should be a handler for the back button
    // toggleHandler should be a handler for the toggle question buttons
    // saveHandler should be a handler for the save options button
    constructor(backHandler: () => void, toggleHandler: (p: keyof Toggles) => void, saveHandler: () => void, id: string) {
        this.id = id;
        this.stage = new Konva.Stage({
            container: id,
            width: this.getDims()[0],
            height: this.getDims()[1],
            visible: false
        })
        // I think we should eventually have a standardized getDimensions method if we want to avoid repeating
        // code to deal with dynamic resizing...

        this.layer = new Konva.Layer();
        this.toggleButtonGroup = new Konva.Group();

        const backLabel = this.simpleLabelFactory(100, 100, "Go Back", backHandler); // should do something w/ screenswitcher
        const capitalToggle = this.simpleLabelFactory(100, 200, "Toggle Capitals", () => toggleHandler("capitalQuestions"));
        const flowersToggle = this.simpleLabelFactory(100, 300, "Toggle Flowers", () => toggleHandler("flowerQuestions"));
        const abbreviationToggle = this.simpleLabelFactory(100, 400, "Toggle Abbreviations", () => toggleHandler("abbreviationQuestions"));
        const saveButton = this.simpleLabelFactory(100, 500, "Save", () => saveHandler());

        this.toggleButtonGroup.add(backLabel);
        this.toggleButtonGroup.add(capitalToggle);
        this.toggleButtonGroup.add(flowersToggle);
        this.toggleButtonGroup.add(abbreviationToggle);
        this.toggleButtonGroup.add(saveButton);

        this.layer.add(this.toggleButtonGroup);
        this.stage.add(this.layer);
    }

    // temporary, may be replaced depending on how UI components factories shape up
    // for now, produces a button given a position, text, and a handler function
    private simpleLabelFactory(xPos: number, yPos: number, labelText: string, handler: () => void): Konva.Label {
        // add a basic checkbox character for toggle buttons
        let newLabel: string = labelText;
        if (labelText.includes("Toggle")) {
            newLabel += ": \u2610";
        }

        const out = new Konva.Label({
            x: xPos,
            y: yPos,
            opacity: 0.75
        });
        out.add(
            new Konva.Tag({
                fill: "lightblue",
                stroke: "black", 
                strokeWidth: 1
            })
        );
        out.add(
            new Konva.Text({
                text: newLabel,
                fill: 'black',
                fontSize: 20,
                padding: 4
            })
        );

        out.on('mouseover', function (e) {
            e.target.getStage()!.container().style.cursor = 'pointer';
        });
        out.on('mouseout', function (e) {
            e.target.getStage()!.container().style.cursor = 'default';
        });

        out.on("click", (e) => {
            // toggle the checkbox if the button text has one
            let txt: string = e.target?.attrs?.text ?? "";
            if (txt.endsWith("\u2611")) {
                e.target.setAttrs({text: txt.substring(0, txt.length - 1) + "\u2610"});
            } else if (txt.includes("\u2610")) {
                e.target.setAttrs({text: txt.substring(0, txt.length - 1) + "\u2611"});
            }
            handler();
        });
        return out;
    }

    show(): void {
        this.stage.visible(true);
        this.stage.draw();
    }

    hide(): void {
        this.stage.visible(false);
        this.stage.draw();
    }

    getLayer(): Konva.Layer {
        return this.layer;
    }

    getStage(): Konva.Stage {
        return this.stage;
    }

    getDims(): number[] {
        let containerEl = document.getElementById(this.id)!;
        const width  = Math.max(320, Math.floor(containerEl.getBoundingClientRect().width));
        const height = Math.max(220, Math.floor(containerEl.getBoundingClientRect().height));
        return [width, height];
    }

}