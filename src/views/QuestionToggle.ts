import Konva from "konva";

export class QuestionToggleView {
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;
    private currentToggled: { "capitalQuestions": boolean, "flowerQuestions": boolean, "abbreviationQuestions": boolean };

    constructor() {
        this.layer = new Konva.Layer({ visible: false });
        this.toggleButtonGroup = new Konva.Group();
        this.currentToggled = { 
            "capitalQuestions": false, 
            "flowerQuestions": false, 
            "abbreviationQuestions": false 
        }

        const backLabel = this.simpleLabelFactory(100, 100, "Go Back", this.saveOptions); // dummy until controller is better implemented
        const capitalToggle = this.simpleLabelFactory(100, 200, "Toggle Capitals", () => this.toggleOption("capitalQuestions"));
        const flowersToggle = this.simpleLabelFactory(100, 300, "Toggle Flowers", () => this.toggleOption("flowerQuestions"));
        const abbrevationToggle = this.simpleLabelFactory(100, 400, "Toggle Abbreviations", () => this.toggleOption("abbreviationQuestions"));
        const saveButton = this.simpleLabelFactory(100, 500, "Save", this.saveOptions);

        // TODO: 
        // make buttons have "feeling"
            // also make the toggles visible!
        // route backlabel back to modelview, potentially done via param


        this.layer.add(this.toggleButtonGroup);
    }

    simpleLabelFactory(xPos: number, yPos: number, labelText: string, handler: () => void): Konva.Label {
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

    toggleOption(key: keyof typeof this.currentToggled): void {
        this.currentToggled[key] = !this.currentToggled[key];
    }

    saveOptions(): void {
        // TODO: update the Question.ts model
        console.log(this.currentToggled);
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