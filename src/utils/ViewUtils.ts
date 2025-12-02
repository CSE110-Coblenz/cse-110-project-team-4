import Konva from "konva";
import { QuestionType } from "../models/Questions";
import click from "../data/sfx/click.wav";

const clickAudio = new Audio(click);
clickAudio.preload = "auto";
clickAudio.load();
clickAudio.volume = 0.4;

function playClick() {
    clickAudio.currentTime = 0;
    clickAudio.play();
}

export function getDims(clampX: number, clampY: number, id: string) {
    let containerEl = document.getElementById(id);
    if (containerEl == null) {
        return [ clampX, clampY ];
    }
    const width  = Math.max(clampX, Math.floor(containerEl.clientWidth  || 0));
    const height = Math.max(clampY, Math.floor(containerEl.clientHeight || 0));
    return [ width, height ];
}

export function simpleLabelFactory(xPos: number, yPos: number, labelText: string, handler: () => void): Konva.Group {
    // add a basic checkbox character for toggle buttons
    let newLabel: string = labelText;
    if (labelText.includes("Toggle")) {
        newLabel += ": \u2610";
    }
    let out = new Konva.Group({});

    let text = new Konva.Text({
        x: xPos,
        y: yPos,
        text: newLabel,
        fill: 'black',
        fontSize: 20,
        padding: 4
    });

    let w = (labelText.includes("Toggle")) ? 250 : text.width() + 10;
    let rect = new Konva.Rect({
        x: xPos,
        y: yPos - 5,
        opacity: 1,
        cornerRadius: 10,
        fill: "#daafafff",
        stroke: "black",
        width: w + 5,
        height: text.height() + 10
    });

    text.offsetX(text.width() / 2);
    rect.offsetX(rect.width() / 2);

    out.add(rect);
    out.add(text);

    out.on('mouseover', function (e) {
        e.target.getStage()!.container().style.cursor = 'pointer';
    });
    out.on('mouseout', function (e) {
        e.target.getStage()!.container().style.cursor = 'default';
    });

    out.on("click", (e) => {
        // play audio
        playClick();
        
        // toggle the checkbox if the button text has one
        let target = e.target
        let txt: string = "";
        let newTarget: Konva.Text | undefined;
        if (target != null) {
            let siblings = target.getAttr("parent").getChildren()
            siblings.forEach((sibling: { attrs: { text: string; }; }) => {
                if (sibling instanceof Konva.Text) {
                    txt = sibling.attrs.text
                    newTarget = sibling
                }
            })
        }
        //console.log("in click handler", e.target);
        if (txt.endsWith("\u2611") && typeof newTarget != "undefined") {
            newTarget.setAttrs({text: txt.substring(0, txt.length - 1) + "\u2610"});
        } else if (txt.includes("\u2610") && typeof newTarget != "undefined") {
            newTarget.setAttrs({text: txt.substring(0, txt.length - 1) + "\u2611"});
        }

        // grey-out effect
        const rectNode = out.findOne('Rect');
        if (rectNode && rectNode instanceof Konva.Rect) {
            const rect = rectNode as Konva.Rect; // type cast
            const originalFill = rect.fill();
            rect.fill('#b38fa0ff'); // darker color of button
            rect.getLayer()?.batchDraw();

            setTimeout(() => {
                rect.fill(originalFill); // restore original color
                rect.getLayer()?.batchDraw();
            }, 300); // duration the color lasts
        }

        handler();
    });
    return out;
}