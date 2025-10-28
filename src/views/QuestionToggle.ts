import Konva from "konva";

export interface Toggles {
    [key: string]: boolean
}

export class QuestionToggleView {
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;

    constructor(backHandler: () => void, toggleHandler: (p: keyof Toggles) => void, saveHandler: () => void) {
        this.layer = new Konva.Layer({ visible: false });
        this.toggleButtonGroup = new Konva.Group();

        const backLabel = this.simpleLabelFactory(100, 100, "Go Back", backHandler); // should do something w/ screenswitcher
        const capitalToggle = this.simpleLabelFactory(100, 200, "Toggle Capitals", () => toggleHandler("capitalQuestions"));
        const flowersToggle = this.simpleLabelFactory(100, 300, "Toggle Flowers", () => toggleHandler("flowerQuestions"));
        const abbrevationToggle = this.simpleLabelFactory(100, 400, "Toggle Abbreviations", () => toggleHandler("abbreviationQuestions"));
        const saveButton = this.simpleLabelFactory(100, 500, "Save", () => saveHandler());

        this.toggleButtonGroup.add(backLabel);
        this.toggleButtonGroup.add(capitalToggle);
        this.toggleButtonGroup.add(flowersToggle);
        this.toggleButtonGroup.add(abbrevationToggle);
        this.toggleButtonGroup.add(saveButton);

        // TODO: 
        // make buttons have "feeling"
        // get the actual UI nice looking
        // ...test the actual UI, and well, everything else

        this.layer.add(this.toggleButtonGroup);
    }

    private simpleLabelFactory(xPos: number, yPos: number, labelText: string, handler: () => void): Konva.Label {
        const out = new Konva.Label({
            x: xPos,
            y: yPos,
            opacity: 0.75
        });
        out.add(
            new Konva.Tag({
                fill: "gray"
            })
        );
        out.add(
            new Konva.Text({
                text: labelText,
                fill: 'black'
            })
        );

        out.on("click", handler);
        return out;
    }

    show(): void {
        this.layer.visible(true);
        this.layer.draw();
    }

    hide(): void {
        this.layer.visible(false);
        this.layer.draw();
    }

    getLayer(): Konva.Layer {
        return this.layer;
    }
}