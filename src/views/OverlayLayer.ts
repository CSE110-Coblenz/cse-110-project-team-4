// src/views/OverlayLayer.ts
// A self-contained overlay (mask) view for Konva stages. 
// create a new konva layer.
/*==============================================================================
API:
  + constructor(opts: { stage: Konva.Stage; onBackdropClick?: 
            () => void; fill?: string; listening?: boolean })
  + mount(): void
  + show(): void
  + hide(): void
  + isVisible(): boolean
  + resize(): void
  + moveToTop(): void
  + getLayer(): Konva.Layer
  + dispose(): void
==============================================================================*/


import Konva from "konva";

const MASK_COLOR = "#0000008e";  // fill color, overlay layer

export interface OverlayLayerOptions {
    stage: Konva.Stage;                 
    onBackdropClick?: () => void;       // click mask event: e.g. click the mask close the question card.
    fill?: string;                      // mask coloer
    listening?: boolean;                // Intercept event:  true or F
}

export class OverlayLayer {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private backdrop: Konva.Rect;
    private ro?: ResizeObserver;
    private onBackdropClick?: () => void;

        constructor(opts: OverlayLayerOptions) {
            this.stage = opts.stage;
            this.onBackdropClick = opts.onBackdropClick;

            // new konva layer
            this.layer = new Konva.Layer({
            listening: opts.listening ?? true,
            visible: false,
            });

            // aotu size with the map-root stage
            const dims = this.getStageDims();
            this.backdrop = new Konva.Rect({
                x: 0,
                y: 0,
                width: dims.width,
                height: dims.height,
                fill: opts.fill ?? MASK_COLOR,
                listening: true,
            });

            // overlay evnet, to cover the layer event above.
            this.backdrop.on("click", () => this.onBackdropClick?.());
            this.layer.add(this.backdrop);
    }

    // mount the layer to the stage and listening size change.
    public mount(): void {
        this.stage.add(this.layer);
        this.moveToTop();

        const container = this.stage.container();
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(container);
    }

    public show(): void {
        this.layer.visible(true);
        this.moveToTop();
        this.stage.batchDraw();
    }

    public hide(): void {
        this.layer.visible(false);
        this.stage.batchDraw();
    }

    // for testing.
    public isVisible(): boolean {
        return this.layer.visible();
    }

    // for testing, swtich the order with other layers.
    public getLayer(): Konva.Layer {
        return this.layer;
    }

    public resize(): void {
        const dims = this.getStageDims();
        this.backdrop.size({ width: dims.width, height: dims.height });
        this.stage.batchDraw();
    }

    public moveToTop(): void {
        this.layer.moveToTop();
    }

    public dispose(): void {
        this.ro?.disconnect();
        this.layer.destroy();
    }

    // --- Helpers ---
    private getStageDims(): { width: number; height: number } {
        const container = this.stage.container();
        const w = this.stage.width() || container.clientWidth || 0;
        const h = this.stage.height() || container.clientHeight || 0;
        return { width: w, height: h };
    }
}
