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
}
