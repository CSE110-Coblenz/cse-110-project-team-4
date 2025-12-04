// src/views/TimerDisplayView.ts
/*=============================
  VIEW LAYER
    Displays the game timer and region information in the bottom-right HUD.
    
    Sprint 3 updates (Nov 2025):
    - Redesigned visual style: Transparent background, bold fonts.
    - Added Region/Location Pin icon and text.
    - Implemented responsive centering logic based on container size.
    - Removed fixed background boxes for a cleaner look.

    Public API:
    + constructor(stage: Konva.Stage, existingLayer?: Konva.Layer)
    + updateTimer(seconds: number): void
    + resizeToStage(): void  <-- Ensures center alignment
    + show(): void
    + hide(): void

    // The original code is in the comment block at the bottom.
==============================*/

import Konva from "konva";

export default class TimerViewCorner {
  private timerLayer: Konva.Layer;
  private group: Konva.Group;
  private bg: Konva.Rect;
  private timeLabel: Konva.Text;
  private regionGroup: Konva.Group;
  private regionText: Konva.Text;

  private font = '"GameFont", "Segoe UI Black", monospace';
  private color = "#3d2b1f";

  constructor(
    public TimerStage: Konva.Stage,
    existingLayer?: Konva.Layer
  ) {
    this.timerLayer = existingLayer ?? new Konva.Layer({ listening: false });

    // 1. Time display (smaller font size to prevent it from filling the entire height)
    this.timeLabel = new Konva.Text({
      text: "0:00",
      fontSize: 32, // Font 40 -> 32
      fontFamily: this.font,
      fill: this.color,
      align: "center",
      fontStyle: "bold",
      shadowColor: "rgba(0,0,0,0.1)",
      shadowOffset: { x: 1, y: 1 },
    });

    // 2. Regional Information Group
    this.regionGroup = new Konva.Group({});
    // locaton pin shape
    const pinIcon = new Konva.Path({
      data: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
      fill: "#a63e3e",
      scaleX: 1, // Scale 1.2 -> 1
      scaleY: 1,
      x: 0,
      y: 0,
    });

    this.regionText = new Konva.Text({
      text: "REGION: WEST",
      fontSize: 12, // Font 14 -> 12
      fontFamily: this.font,
      fill: "#5a4632",
      x: 20,
      y: 2,
      fontStyle: "bold",
    });

    this.regionGroup.add(pinIcon, this.regionText);

    this.bg = new Konva.Rect({
      fill: "transparent",
      stroke: "",
    });

    this.group = new Konva.Group({ listening: false });
    this.group.add(this.bg, this.timeLabel, this.regionGroup);

    this.timerLayer.add(this.group);
    if (!existingLayer) this.TimerStage.add(this.timerLayer);

    this.relayout();
    this.timerLayer.draw();
  }

  updateTimer(seconds: number) {
    const formatted = this.format(seconds);
    this.timeLabel.text(formatted);
    this.relayout();
    this.timerLayer.batchDraw();
  }

  private relayout() {
    const stageW = this.TimerStage.width();
    const stageH = this.TimerStage.height();

    this.bg.width(stageW);
    this.bg.height(stageH);

    // 1. Centering time show
    const timeW = this.timeLabel.width();
    this.timeLabel.position({
      x: (stageW - timeW) / 2,
      y: 10,
    });

    // 2. Information on the central area
    const regionContentW = this.regionText.x() + this.regionText.width();
    this.regionGroup.position({
      x: (stageW - regionContentW) / 2,
      y: 50,
    });
  }

  private format(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }
}

/* 
import Konva from "konva";

export default class TimerViewCorner {
  private timerLayer: Konva.Layer;
  private group: Konva.Group;
  private bg: Konva.Rect;
  private label: Konva.Text;

  //NEED TO MAKE THESE ADJUSTABLE LATER to diff screen sizes
  private outerPad = 16;
  private innerPadX = 12;
  private innerPadY = 8;
  private minBoxW = 120;
  private minBoxH = 44;

  constructor(public TimerStage: Konva.Stage) {
    this.timerLayer = new Konva.Layer({ listening: false });

    this.label = new Konva.Text({
      text: this.format(0),
      fontSize: 28,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#222",
      listening: false,
    });

    this.bg = new Konva.Rect({
      width: this.minBoxW,
      height: this.minBoxH,
      fill: "#f7f7f7",
      stroke: "#ccc",
      cornerRadius: 6,
      listening: false,
    });

    this.group = new Konva.Group({ listening: false });
    this.group.add(this.bg);
    this.group.add(this.label);

    this.timerLayer.add(this.group);
    this.TimerStage.add(this.timerLayer);

    this.relayout();
    this.timerLayer.draw();
  }

  updateTimer(seconds: number) {
    this.label.text(this.format(seconds));
    this.relayout();
    this.timerLayer.batchDraw();
  }

  show() { this.timerLayer.visible(true);  this.timerLayer.batchDraw(); }
  hide() { this.timerLayer.visible(false); this.timerLayer.batchDraw(); }

    
  private relayout() {
    const textW = Math.ceil(this.label.width());
    const textH = Math.ceil(this.label.height());
    const boxW = Math.max(this.minBoxW, textW + this.innerPadX * 2);
    const boxH = Math.max(this.minBoxH, textH + this.innerPadY * 2);

    this.bg.width(boxW);
    this.bg.height(boxH);

    this.label.x(this.innerPadX);
    this.label.y(this.innerPadY);

    const gx = this.TimerStage.width() - this.outerPad - boxW;
    const gy = this.outerPad;
    this.group.position({ x: gx, y: gy });
  }

  private format(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }
} */
