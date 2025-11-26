// src/views/WelcomeScreenView.ts
/*==============================================================================
WelcomeScreenView

Public API
- constructor(startHandler(), infoHandler(), optionsHandler(), id: string)
- show()
- hide()
- getLayer()
- getStage()
- getInput() - for name input
- resize()

Konva/Visual Elements
- stage: stage that holds layers for both this menu and submenus
- layer: layer that holds groups only for the welcome screen
- toggleButtonGroup: group that holds only buttons
- inputEl: input for entering name

Related
- Controller: src/controllers/WelcomeScreenController.ts
==============================================================================*/

import Konva from "konva";
import { getDims, simpleLabelFactory } from "../utils/ViewUtils";
import flagSrc from "../data/img/america-flag.jpg";
import click from "../data/sfx/click.wav";

export class WelcomeScreenView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;
    private titleGroup: Konva.Group;
    private id: string;
    private inputEl;
    private clickAudio: HTMLAudioElement;

    constructor(
        startHandler: () => void, 
        infoHandler: () => void, 
        optionsHandler: () => void, 
        id: string) 
    {
        this.id = id;

        this.clickAudio = new Audio(click);
        this.clickAudio.preload = "auto";

        let [w, h] = getDims(360, 360, id);
        this.stage = new Konva.Stage({
            container: id,
            width: w,
            height: h,
            visible: false
        })

        this.layer = new Konva.Layer({ visible: true });

        this.titleGroup = new Konva.Group({
            x: w / 2,
            y: h / 4 - 10,
            name: "titleGroup",
        });
        let titleText = new Konva.Text({
            text: " WELCOME to the \n U.S. Geography Game!",
            fill: 'black',
            fontSize: 40,
            padding: 4,
            align: "center"
        });
        titleText.offsetX(titleText.width() / 2);
        this.titleGroup.add(titleText);

        this.layer.add(this.titleGroup);

        Konva.Image.fromURL(flagSrc, (flagImage) => {
            flagImage.width(160);
            flagImage.height(100);
            flagImage.y(-(flagImage.height() + 10));
            flagImage.offsetX(flagImage.width() / 2);
            this.titleGroup.add(flagImage);
            this.layer.batchDraw();
        });

        //const startLabel = simpleLabelFactory(w / 2, h / 4 + 100, "Start Game", startHandler);
        //const infoLabel = simpleLabelFactory(w / 2, h / 4 + 300, "How To Play", infoHandler);
        //const optionsLabel = simpleLabelFactory(w / 2, h / 4 + 400, "Options", optionsHandler);

        this.toggleButtonGroup = new Konva.Group();

        const startLabel = simpleLabelFactory(w / 2, h / 4 + 125, "Start Game", () => {
            this.clickAudio.currentTime = 0;
            this.clickAudio.play().catch(err => console.error(err));
            startHandler();
        });

        const infoLabel = simpleLabelFactory(w / 2, h / 4 + 325, "How To Play", () => {
            this.clickAudio.currentTime = 0;
            this.clickAudio.play().catch(err => console.error(err));
            infoHandler();
        });

        const optionsLabel = simpleLabelFactory(w / 2, h / 4 + 425, "Options", () => {
            this.clickAudio.currentTime = 0;
            this.clickAudio.play().catch(err => console.error(err));
            optionsHandler();
        });

        let menuEl = document.getElementById(id);
        const textBox = document.createElement("textarea");
        textBox.placeholder = "Type your name here...";
        textBox.id = "nameInput";
        textBox.style.top = h / 4 + 225 + "px";
        textBox.style.width = "200px";
        textBox.style.left = (w / 2 - 100) + "px";
        textBox.style.position = "absolute";
        textBox.style.zIndex = "1";
        this.inputEl = textBox;
        menuEl?.appendChild(textBox);

        this.toggleButtonGroup.add(startLabel)
        this.toggleButtonGroup.add(infoLabel)
        this.toggleButtonGroup.add(optionsLabel)

        this.layer.add(this.toggleButtonGroup);
        this.stage.add(this.layer);
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
    
        this.titleGroup.x(w / 2);
        this.titleGroup.offsetX(this.titleGroup.width() / 2);

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