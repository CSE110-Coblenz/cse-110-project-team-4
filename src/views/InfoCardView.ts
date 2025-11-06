import Konva from "konva";

export class InfoCardView {
    private layer: Konva.Layer;

    constructor(stage: Konva.Stage) {
        this.layer = new Konva.Layer({ visible: false });
        let group: Konva.Group = new Konva.Group({});
        let text: Konva.Text = new Konva.Text({
            x: 300,
            y: 220,
            text: "HOW TO PLAY:\n\nLorem Ipsum Dolor\n\n Sit Amet\n\nHello World",
            fontSize: 20,
            fontFamily: "Arial",
            width: 500,
            align: 'center'
        });
        let backButton: Konva.Text = new Konva.Text({
            x: 310,
            y: 200,
            text: "Go Back",
            width: 80,
            fontSize: 18,
            fontFamily: "Aria",
            align: 'center'
        });
        let rectangle: Konva.Rect = new Konva.Rect({
            x: 300,
            y: 190,
            width: 500,
            height: text.height() + 45,
            cornerRadius: 10,
            fill: "red",
            stroke: "brown"
        });

        backButton.on("click", () => {this.hide()});

        group.add(rectangle);
        group.add(text);
        group.add(backButton);
        this.layer.add(group);
        stage.add(this.layer);
    }

    public show(): void {
        this.layer.visible(true);
        this.layer.draw();
    }
    
    public hide(): void {
        this.layer.visible(false);
        this.layer.draw();
    }

    public getLayer() {
        return this.layer;
    }
}