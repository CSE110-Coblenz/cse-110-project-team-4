import Konva from "konva";
import { QuestionType } from "../models/Questions";

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
        opacity: 0.75,
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