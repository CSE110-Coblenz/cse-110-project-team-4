// src/views/PopUpView.ts
/*==============================================================================
PopUpView

Public API
- constructor(layer: Konva.Layer, text: string)
- show()
- hide()
- resize()

Konva Elements
- popUpGroup: Holds rectangle + text for the pop up

==============================================================================*/

import Konva from "konva"
import { getDims } from "../utils/ViewUtils";

const POPUP_FILL_COLOR = "#e8e3e5ff"
const POPUP_LINE_COLOR = "#000000ff"

export class PopUpView {
    private popUpGroup: Konva.Group;

    constructor(layer: Konva.Layer, text: string) {
        this.popUpGroup = new Konva.Group({ visible: false })

        let popUpText = new Konva.Text({
            x: layer.width() / 2,
            text: text,
            fontSize: 18,
            fill: POPUP_LINE_COLOR,
            align: 'center',
            verticalAlign: 'middle',
        })

        let textWidth = popUpText.width()
        let textHeight = popUpText.height()

        popUpText.offsetX(textWidth / 2)
        popUpText.offsetY(textHeight / 2)
        popUpText.y(textHeight + 20)

        let rect = new Konva.Rect({
            x: layer.width() / 2,
            y: textHeight + 20,
            fill: POPUP_FILL_COLOR,
            stroke: POPUP_LINE_COLOR,
            strokeWidth: 2,
            cornerRadius: 5,
            width: textWidth + 10,
            height: textHeight + 20,
            offsetX: textWidth / 2 + 5,
            offsetY: textHeight / 2 + 10
        })

        this.popUpGroup.add(rect)
        this.popUpGroup.add(popUpText)
        layer.add(this.popUpGroup)
    }

    show() {
        this.popUpGroup.visible(true)
        this.popUpGroup.draw()
    }

    hide() {
        this.popUpGroup.visible(false)
        this.popUpGroup.draw()
    }

    resize() {
        let [w, h] = getDims("welcome-root")
        this.popUpGroup.getChildren().forEach((child) => {
            child.x(Math.max(10, w / 2))
        })
    }
}