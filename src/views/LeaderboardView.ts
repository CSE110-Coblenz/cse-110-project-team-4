// src/views/LeaderboardView.ts
// 
// 
/*=============================
  VIEW LAYER:
  - Use Konva to draw the Leaderboard
  - helper functions such as view, hide
  - Exposes onConfirm() callback for external controllers to hook answer submission

==============================*/

import Konva from "konva";
import type { LeaderboardEntry } from "../models/LeaderboardModel";
import { STAGE_WIDTH } from "../utils/constants";

// constants
const TEXT_COLOR = "#000000ff";

// title constants
const TITLE_Y = 100; // Y position of the title text

// entry constants
const START_Y = TITLE_Y + 80; // Y position of first entry
const ENTRY_SPACING = 40; // vertical spacing between entries
const ENTRY_FONTSIZE = 32;
const ENTRY_COLOR_1ST = "#d4a91aff";
const ENTRY_COLOR_2ND = "#686868ff";
const ENTRY_COLOR_3RD = "#9d6226ff";

export class LeaderboardView {
    private group: Konva.Group;

    constructor() {
        this.group = new Konva.Group();
    }

    // assumes entries are already sorted
    draw(entries: LeaderboardEntry[]): void {

        // Reset contents
        this.group.destroyChildren();

        // Draw title
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: TITLE_Y,
			text: "High Scores",
			fontSize: 48,
			fill: TEXT_COLOR,
			align: "center",
		});
		title.offsetX(title.width() / 2);
		this.group.add(title);

        this.drawEntries(entries);
    }

    drawEntries(entries: LeaderboardEntry[]): void {
        entries.forEach((entry, index) => {
            const y = START_Y + index * ENTRY_SPACING;

            let fillColor = TEXT_COLOR;

            if (index === 0) fillColor = ENTRY_COLOR_1ST;
            else if (index === 1) fillColor = ENTRY_COLOR_2ND;
            else if (index === 2) fillColor = ENTRY_COLOR_3RD;

            const text = new Konva.Text({
                x: STAGE_WIDTH / 2,
                y: y,
                text: `${index + 1}. ${entry.player.name} - ${entry.score}`,
                fontSize: ENTRY_FONTSIZE,
                fill: fillColor,
                align: "center",
            });
            this.group.add(text);
            text.offsetX(text.width() / 2);
        });
    }

     // Show leaderboard on the stage
    view(stage: Konva.Stage): void {
        this.group.show();
    }

    // Hide leaderboard from the stage
    hide(): void {
        this.group.hide();
    }

    getGroup(): Konva.Group {
		return this.group;
	}
}
