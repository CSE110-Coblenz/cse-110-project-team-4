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
                border: "1px solid black"
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
            let txt: string = e.target.attrs.text;
            if (txt.includes("\u2611")) {
                e.target.setAttrs({text: txt.substring(0, txt.length - 1) + "\u2610"});
            } else if (txt.includes("\u2610")) {
                e.target.setAttrs({text: txt.substring(0, txt.length - 1) + "\u2611"});
            }
            handler();
        });
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