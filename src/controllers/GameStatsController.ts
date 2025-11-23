// src/controllers/GameStatsController.ts
/*=============================
  CONTROLLER LAYER (MVC)
    Manages game statistics tracking and display.
        - Tracks player points and state completion counts.
        - Manages the bottom-left HUD (Lightbox).

    Sprint 3 updates (Nov 2025):
    - Added bindNavigation() to inject Home/Options/Help handlers from Main.ts.
    - Added attachHudStage() to render stats into the dedicated HUD container.
    - Refactored to support the new GameStatsLightbox layout.

    Public API:
    + constructor(map: MapController)
    + bindNavigation(handlers: NavHandlers): void
    + attachHudStage(stage: Konva.Stage): void
    + updateCounts(grey, green, red, points): void
    + onCorrect(stateCode: string): void
    + onIncorrect(stateCode: string): void
    + resetPoints(): void
    + isFinished(): number

	Update history: The original code is in the comment block at the bottom.
        Sprint 2 (Nov 2025):
        - Added points tracking system (10 points per correct answer).
        - Added onCorrect(stateCode) to mark states complete and increment points.
        - Rewrote constructor to derive counts from MapController's store for live updates.
        - Added getColorCounts() helper to compute state status distribution.
        - Safely adds lightbox to map's Konva stage via passed MapController.
==============================*/

import Konva from "konva";
import GameStatsLightbox from "../views/GameStatsLightbox"; // ADDED: Reuse the existing lightbox view from the PR.
import { MapController } from "./MapController"; // ADDED: We need access to map.getStage() (already provided in MapController).
import { StateStatus } from "../models/State"; //ADDED: import to check color/status
import { MAX_ERRORS, CORRECT_POINT_VALUE } from "../utils/constants";

// new : Navigation processor type
type NavHandlers = {
	onHome?: () => void;
	onOptions?: () => void;
	onHelp?: () => void;
};

export class GameStatsController {
	private layer: Konva.Layer;
	private lightbox: GameStatsLightbox;
	private points = 0;
	
	//new Navigation
	private navHandlers: NavHandlers = {};

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
	}

	// new Methods for binding navigation logic
	public bindNavigation(handlers: NavHandlers) {
		this.navHandlers = handlers;
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
		this.points = points;
		this.lightbox.updateCounts(grey, green, red, points);
		this.layer.draw();
	}

	// call this when a state is correctly answered
	public onCorrect(stateCode: string) {
		this.map.getStore().setStatus(stateCode, StateStatus.Complete);
		this.points += CORRECT_POINT_VALUE;

		const { grey, green, red } = this.getColorCounts();
		this.updateCounts(grey, green, red, this.points);
	}

	public onIncorrect(stateCode: string) {
		this.map.getStore().setStatus(stateCode, StateStatus.Partial);

		const { grey, green, red } = this.getColorCounts();
		this.updateCounts(grey, green, red, this.points);
	}

	public attemptReconnect() {
		this.map.getStage()?.add(this.layer);
		this.layer.draw();
	}

	public isFinished() {
		let { grey, green, red } = this.getColorCounts();
		if (red >= MAX_ERRORS) {
			return -1
		} else if (grey === 0) {
			return 1
		} else {
			return 0
		}
	}

	public resetPoints() {
		this.points = 0;
	}

	public attachHudStage(stage: Konva.Stage): void {
		this.layer = new Konva.Layer();
		stage.add(this.layer);
		this.lightbox.destroy();
		const { grey, green, red } = this.getColorCounts();
/* 		this.lightbox = new GameStatsLightbox(
			{ greyCount: grey, greenCount: green, redCount: red, points: this.points },
			stage.width(),
			stage.height()
		); */
		
		// new : Inject navigation callbacks during creation.
		this.lightbox = new GameStatsLightbox(
			{ 
				greyCount: grey, 
				greenCount: green, 
				redCount: red, 
				points: this.points,
				...this.navHandlers // inject handlers
			},
			stage.width(),
			stage.height()
		);
		this.layer.add(this.lightbox.getGroup());
		this.layer.draw();
	}

}


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
