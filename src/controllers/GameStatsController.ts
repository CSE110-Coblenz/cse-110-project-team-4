/**
 * ORIGINAL (for reference only; now encapsulated in this controller):
 * import Konva from "konva";
 * 
 * const layer = new Konva.Layer();
 * const lightbox = new GameStatsLightbox({
 *   greyCount: 10,
 *   greenCount: 5,
 *   redCount: 2,
 * });
 * // Add lightbox to the layer
 * layer.add(lightbox.getGroup());
 * // Add layer to the main stage (map)
 * const stage = map.getStage();
 * if (stage) {
 *   stage.add(layer);
 *   layer.draw();
 * }
 */
// src/controllers/GameStatsController.ts

import Konva from "konva";
import GameStatsLightbox from "../views/GameStatsLightbox"; // ADDED: Reuse the existing lightbox view from the PR.
import { MapController } from "./MapController"; // ADDED: We need access to map.getStage() (already provided in MapController).

export class GameStatsController {
    private layer: Konva.Layer;            
    private lightbox: GameStatsLightbox;

    // ADDED: Accept the MapController so we can safely grab the Stage without re-querying DOM.
    constructor(private map: MapController) {
        this.layer = new Konva.Layer({ listening: false });
        this.lightbox = new GameStatsLightbox({
            greyCount: 10,
            greenCount: 5,
            redCount: 2,
    });

    // Add lightbox to the layer
    this.layer.add(this.lightbox.getGroup());

    // Add layer to the main stage (map)
    const stage = this.map.getStage();
    if (stage) {
        stage.add(this.layer);
        this.layer.draw();
    }
  }


    //Small helper to update counts later without recreating the overlay.
    public updateCounts(grey: number, green: number, red: number): void {
        this.lightbox.updateCounts(grey, green, red);
    }
}
export default GameStatsController; // ADDED: Default export for convenience in main.ts
