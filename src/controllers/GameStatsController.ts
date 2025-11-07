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
import { StateStatus } from "../models/State"; //ADDED: import to check color/status

export class GameStatsController {
	private layer: Konva.Layer;
	private lightbox: GameStatsLightbox;
	private points = 0;

	// ADDED: Accept the MapController so we can safely grab the Stage without re-querying DOM.
	constructor(private map: MapController) {
		this.layer = new Konva.Layer({ listening: false });
		const { grey, green, red } = this.getColorCounts();

		this.lightbox = new GameStatsLightbox({
			greyCount: grey,
			greenCount: green,
			redCount: red,
			points: this.points,
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

	private getColorCounts() {
		const all = this.map.getStore().getAll();
		let grey = 0,
			green = 0,
			red = 0;

		for (const s of all) {
			if (s.status === StateStatus.NotStarted) grey++;
			else if (s.status === StateStatus.Complete) green++;
			else if (s.status === StateStatus.Partial) red++;
		}
		return { grey, green, red };
	}

	// update counts + points live
	public updateCounts(grey: number, green: number, red: number, points: number): void {
		this.lightbox.updateCounts(grey, green, red, points);
		this.layer.draw();
	}

	// call this when a state is correctly answered
	public onCorrect(stateCode: string) {
		this.map.getStore().setStatus(stateCode, StateStatus.Complete);
		this.points += 10;

		const { grey, green, red } = this.getColorCounts();
		this.updateCounts(grey, green, red, this.points);
	}
}