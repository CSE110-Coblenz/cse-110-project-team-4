// src/views/QuestionToggleView.ts
/*==============================================================================
QuestionToggleView

Public API
- constructor(backHandler(), toggleHandler(keyof Toggles), saveHandler(), stage: Konva.Stage, id: string)
    - Each handler is a callback for when a button is clicked
- show() - makes layer visible
- hide() - makes layer hidden
- resize() - callback for when window is resized
- getLayer(): Konva.Layer - returns Konva layer

Layers & Groups
- layer: wrapper layer that just contains toggleButtonGroup
- toggleButtonGroup: contains buttons returned from SimpleLabelFactory and background rectangle

Design Notes
- similar labels constructed by factory method
- show/hide similar to choices in lab

Related
- Controller: src/controllers/QuestionToggleController.ts
- Model: src/models/QuestionBankModel.ts
==============================================================================*/

import Konva from "konva";
import { getDims, simpleLabelFactory } from "../utils/ViewUtils";
import { OPTION_MIN_ERRORS, OPTION_MAX_ERRORS } from "../utils/constants";


const BUTTON_WIDTH = 300;
const HEIGHT_SCALAR = 12;
const CORNER_RADIUS = 10;
const BOX_BG = "#eee";
const STROKE_COLOR = "black";

// slider config
const SLIDER_TRACK_WIDTH = 220;
const SLIDER_TRACK_HEIGHT = 6;

export interface Toggles {
    [key: string]: boolean
}

export class QuestionToggleView {
    private layer: Konva.Layer;
    private toggleButtonGroup: Konva.Group;
    private startW: number;
    private id: string;

    // slider state
    private currentMaxErrors: number;
    private onMaxErrorsChange?: (value: number) => void;

    // slider nodes (kept for resize)
    private sliderGroup?: Konva.Group;
    private sliderTrack?: Konva.Rect;
    private sliderThumb?: Konva.Circle;
    private sliderLabel?: Konva.Text;

    // backHandler should be a handler for the back button
    // toggleHandler should be a handler for the toggle question buttons
    // saveHandler should be a handler for the save options button
    constructor(
        backHandler: () => void, 
        toggleHandler: (p: keyof Toggles) => void, 
        saveHandler: () => void, 
        stage: Konva.Stage, 
        id: string,
        initialMaxErrors: number = OPTION_MAX_ERRORS,
        onMaxErrorsChange?: (value: number) => void) 
    {
        this.layer = new Konva.Layer({
            visible: false
        });
        this.id = id;

        this.onMaxErrorsChange = onMaxErrorsChange;

        // clamp init [min, max]
        this.currentMaxErrors = Math.min(
            OPTION_MAX_ERRORS,
            Math.max(OPTION_MIN_ERRORS, initialMaxErrors)
        );
        this.onMaxErrorsChange = onMaxErrorsChange; 
        
        let [w, h] = getDims(360, 360, id)
        this.startW = w;
        this.toggleButtonGroup = new Konva.Group();

        const backLabel = simpleLabelFactory(w / 2, 2 * h / HEIGHT_SCALAR, "Go Back", backHandler);
        const capitalToggle = simpleLabelFactory(w / 2, 3 * h / HEIGHT_SCALAR, "Toggle Capitals", () => toggleHandler("capitalQuestions"));
        const flowersToggle = simpleLabelFactory(w / 2, 4 * h / HEIGHT_SCALAR, "Toggle Flowers", () => toggleHandler("flowerQuestions"));
        const abbreviationToggle = simpleLabelFactory(w / 2, 5 * h / HEIGHT_SCALAR, "Toggle Abbreviations", () => toggleHandler("abbreviationQuestions"));
        const dateToggle = simpleLabelFactory(w / 2, 6 * h / HEIGHT_SCALAR, "Toggle Creation Dates", () => toggleHandler("dateQuestions"));
        
        // new Slider row
        const sliderY = (7 * h) / HEIGHT_SCALAR;
        const sliderGroup = this.createMaxErrorsSlider(w / 2, sliderY);

        const saveButton = simpleLabelFactory(w / 2, 8 * h / HEIGHT_SCALAR, "Save", () => saveHandler());
        
        const rect = new Konva.Rect({
            x: w / 4,
            y: h / 8,
            width: w / 2,
            height: 6 * h / 8,
            fill: BOX_BG,
            stroke: STROKE_COLOR,
            strokeWidth: 1,
            cornerRadius: CORNER_RADIUS
        })

        capitalToggle.width(BUTTON_WIDTH);
        flowersToggle.width(BUTTON_WIDTH);
        abbreviationToggle.width(BUTTON_WIDTH);
        dateToggle.width(BUTTON_WIDTH);

        this.init(rect, this.toggleButtonGroup);
        this.init(backLabel, this.toggleButtonGroup);
        this.init(capitalToggle, this.toggleButtonGroup);
        this.init(flowersToggle, this.toggleButtonGroup);
        this.init(abbreviationToggle, this.toggleButtonGroup);
        this.init(dateToggle, this.toggleButtonGroup);
        this.init(sliderGroup, this.toggleButtonGroup);
        this.init(saveButton, this.toggleButtonGroup);

        this.layer.add(this.toggleButtonGroup);
        stage.add(this.layer);
    }
        
    private init(node: Konva.Group | Konva.Rect, group: Konva.Group) {
        node.setAttr('centerOffset', this.startW / 2 - node.getAttr('x'));
        group.add(node);
    }

    //new slider max error
    private createMaxErrorsSlider(centerX: number, y: number): Konva.Group {
        const group = new Konva.Group();

        const label = new Konva.Text({
            x: centerX - BUTTON_WIDTH / 2,
            y: y - 18,
            width: BUTTON_WIDTH,
            align: "center",
            text: `Max Mistakes: ${this.currentMaxErrors}`,
            fontSize: 16,
            fontFamily: "Arial",
            fill: "#333"
        });

        const trackX = centerX - SLIDER_TRACK_WIDTH / 2;
        const trackY = y + 4;

        const track = new Konva.Rect({
            x: trackX,
            y: trackY,
            width: SLIDER_TRACK_WIDTH,
            height: SLIDER_TRACK_HEIGHT,
            fill: "#cccccc",
            cornerRadius: SLIDER_TRACK_HEIGHT / 2
        });

        const ratio =
            (this.currentMaxErrors - OPTION_MIN_ERRORS) /
            (OPTION_MAX_ERRORS - OPTION_MIN_ERRORS || 1);
        const thumbX = trackX + ratio * SLIDER_TRACK_WIDTH;

        const thumb = new Konva.Circle({
            x: thumbX,
            y: trackY + SLIDER_TRACK_HEIGHT / 2,
            radius: 8,
            fill: "#1976d2",
            stroke: "#0d47a1",
            strokeWidth: 1,
            draggable: true,

            dragBoundFunc: (pos) => {
                if (!this.sliderTrack) return pos;

                const minX = this.sliderTrack.x();
                const maxX = this.sliderTrack.x() + this.sliderTrack.width();
                let x = Math.min(maxX, Math.max(minX, pos.x));
                return {
                    x,
                    y: trackY + SLIDER_TRACK_HEIGHT / 2
                }
            }
        });

        const updateValue = (newValue: number) => {
            const clamped = Math.min(
                OPTION_MAX_ERRORS,
                Math.max(OPTION_MIN_ERRORS, newValue)
            );
            this.currentMaxErrors = clamped;
            label.text(`Max Mistakes: ${clamped}`);

            const localRatio =
                (clamped - OPTION_MIN_ERRORS) /
                (OPTION_MAX_ERRORS - OPTION_MIN_ERRORS || 1);
            const newX = trackX + localRatio * SLIDER_TRACK_WIDTH;
            thumb.x(newX);

            if (this.onMaxErrorsChange) {
                this.onMaxErrorsChange(clamped);
            }
            const layer = label.getLayer() || thumb.getLayer() || track.getLayer();
            layer?.batchDraw();
        };

        thumb.on("dragend", () => {
            const minX = trackX;
            const maxX = trackX + SLIDER_TRACK_WIDTH;
            const x = Math.min(maxX, Math.max(minX, thumb.x()));
            const percent = (x - minX) / (maxX - minX || 1);
            const raw =
                OPTION_MIN_ERRORS +
                percent * (OPTION_MAX_ERRORS - OPTION_MIN_ERRORS);
            const snapped = Math.round(raw);
            updateValue(snapped);
        });

        track.on("click tap", (evt) => {
            const pos = track.getStage()?.getPointerPosition();
            if (!pos) return;
            let x = pos.x;
            const minX = trackX;
            const maxX = trackX + SLIDER_TRACK_WIDTH;
            if (x < minX) x = minX;
            if (x > maxX) x = maxX;

            const percent = (x - minX) / (maxX - minX || 1);
            const raw =
                OPTION_MIN_ERRORS +
                percent * (OPTION_MAX_ERRORS - OPTION_MIN_ERRORS);
            const snapped = Math.round(raw);
            updateValue(snapped);
        });

        group.add(label);
        group.add(track);
        group.add(thumb);

        this.sliderGroup = group;
        this.sliderTrack = track;
        this.sliderThumb = thumb;
        this.sliderLabel = label;

        return group;
    }

    show(): void {
        this.layer.visible(true);
        this.layer.draw();
    }

    hide(): void {
        this.layer.visible(false);
        this.layer.draw();
    }
public resize(): void {
    const [w] = getDims(360, 360, this.id);

    this.layer.getChildren().forEach((group) => {
        if (group instanceof Konva.Group) {
            group.getChildren().forEach(subnode => {
                if (subnode === this.sliderGroup) return;

                if (subnode instanceof Konva.Group) {
                    subnode.getChildren().forEach(node => {
                        node.x(Math.max(10, w / 2));
                    });
                } else if (
                    subnode instanceof Konva.Rect &&
                    subnode.getAttr("centerOffset")
                ) {
                    subnode.x(
                        Math.max(10, w / 2 - subnode.getAttr("centerOffset"))
                    );
                }
            });
        }
    });

    if (this.sliderTrack && this.sliderThumb && this.sliderLabel) {
        const centerX = w / 2;

        const labelY = this.sliderLabel.y();
        const trackY = this.sliderTrack.y();

        this.sliderLabel.x(centerX - BUTTON_WIDTH / 2);
        this.sliderLabel.y(labelY);
        this.sliderLabel.width(BUTTON_WIDTH);

        const trackX = centerX - SLIDER_TRACK_WIDTH / 2;
        this.sliderTrack.x(trackX);

        const ratio =
            (this.currentMaxErrors - OPTION_MIN_ERRORS) /
            (OPTION_MAX_ERRORS - OPTION_MIN_ERRORS || 1);
        const thumbX = trackX + ratio * SLIDER_TRACK_WIDTH;

        this.sliderThumb.x(thumbX);
        this.sliderThumb.y(trackY + SLIDER_TRACK_HEIGHT / 2);

        this.sliderThumb.dragBoundFunc((pos) => {
            const minX = this.sliderTrack!.x();
            const maxX = this.sliderTrack!.x() + this.sliderTrack!.width();
            let x = Math.min(maxX, Math.max(minX, pos.x));
            return {
                x,
                y: this.sliderTrack!.y() + this.sliderTrack!.height() / 2,
            };
        });
    }

    this.layer.draw();
}


/*     public resize(): void {
        let [w, h] = getDims(360, 360, this.id);

        this.layer.getChildren().forEach((group) => {
            if (group instanceof Konva.Group) {
                group.getChildren().forEach(subnode => {
                    if (subnode === this.sliderGroup) return;
                    if (subnode instanceof Konva.Group) {
                        subnode.getChildren().forEach(node => {
                            node.x(Math.max(10, w / 2 ));
                        });
                    } else if (subnode instanceof Konva.Rect && subnode.getAttr('centerOffset')) {
                        subnode.x(Math.max(10, w / 2 - subnode
                            .getAttr('centerOffset')));
                    }
                });
            }
        });
        
        if (this.sliderGroup && this.sliderTrack && this.sliderThumb && this.sliderLabel) {
            const centerX = w / 2;
            const sliderY = (7 * h) / HEIGHT_SCALAR;

            this.sliderLabel.x(centerX - BUTTON_WIDTH / 2);
            this.sliderLabel.y(sliderY - 18);
            this.sliderLabel.width(BUTTON_WIDTH);

            const trackX = centerX - SLIDER_TRACK_WIDTH / 2;
            const trackY = sliderY + 4;

            this.sliderTrack.x(trackX);
            this.sliderTrack.y(trackY);
            this.sliderTrack.width(SLIDER_TRACK_WIDTH);
            this.sliderTrack.height(SLIDER_TRACK_HEIGHT);

            const ratio =
                (this.currentMaxErrors - OPTION_MIN_ERRORS) /
                (OPTION_MAX_ERRORS - OPTION_MIN_ERRORS || 1);
            const thumbX = trackX + ratio * SLIDER_TRACK_WIDTH;

            this.sliderThumb.x(thumbX);
            this.sliderThumb.y(trackY + SLIDER_TRACK_HEIGHT / 2);
                this.sliderThumb.dragBoundFunc((pos) => {
                const minX = this.sliderTrack!.x();
                const maxX = this.sliderTrack!.x() + this.sliderTrack!.width();
                let x = Math.min(maxX, Math.max(minX, pos.x));
                return {
                    x,
                    y: this.sliderTrack!.y() + this.sliderTrack!.height() / 2,
                };
            });
        }
        this.layer.draw();
    }
 */
    getLayer(): Konva.Layer {
        return this.layer;
    }
}