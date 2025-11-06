import Konva from "konva";

export class MainScreenView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;
    private id: string;
    private inputEl;

    // backHandler should be a handler for the back button
    // toggleHandler should be a handler for the toggle question buttons
    // saveHandler should be a handler for the save options button
    constructor(startHandler: () => void, infoHandler: () => void, optionsHandler: () => void, id: string) {
        this.id = id;
        this.stage = new Konva.Stage({
            container: id,
            width: this.getDims()[0],
            height: this.getDims()[1],
            visible: false
        })
        // I think we should eventually have a standardized getDimensions method if we want to avoid repeating
        // code to deal with dynamic resizing...

        this.layer = new Konva.Layer({ visible: true });
        this.toggleButtonGroup = new Konva.Group();

        const startLabel = this.simpleLabelFactory(100, 100, "Start Game", startHandler);
        const infoLabel = this.simpleLabelFactory(100, 200, "How To Play", infoHandler);
        const optionsLabel = this.simpleLabelFactory(100, 300, "Options", optionsHandler);

        let menuEl = document.getElementById(id);
        const textBox = document.createElement("textarea");
        textBox.id = "nameInput";
        textBox.style.top = "100px";
        textBox.style.left = "300px";
        textBox.style.position = "absolute";
        textBox.style.zIndex = "1";
        this.inputEl = textBox;
        menuEl?.appendChild(textBox);

        this.toggleButtonGroup.add(startLabel);
        this.toggleButtonGroup.add(infoLabel);
        this.toggleButtonGroup.add(optionsLabel);

        this.layer.add(this.toggleButtonGroup);
        this.stage.add(this.layer);
    }

    // temporary, may be replaced depending on how UI components factories shape up
    // for now, produces a button given a position, text, and a handler function
    private simpleLabelFactory(xPos: number, yPos: number, labelText: string, handler: () => void): Konva.Label {
        // add a basic checkbox character for toggle buttons
        let newLabel: string = labelText;

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

        out.on("click", () => {
            // toggle the checkbox if the button text has one
            handler();
        });
        return out;
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

    getDims(): number[] {
        let containerEl = document.getElementById(this.id)!;
        const width  = Math.max(360, Math.floor(containerEl.clientWidth  || 0));
        const height = Math.max(360, Math.floor(containerEl.clientHeight || 0));
        return [ width, height ];
    }
}