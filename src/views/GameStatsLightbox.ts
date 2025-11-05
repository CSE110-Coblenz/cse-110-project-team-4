// src/views/GameStatsLightbox.ts

import Konva from "konva";
import {MAX_ERRORS} from "../utils/constants";

export type GameStatsLightboxOptions = {
  greyCount: number;
  greenCount: number;
  redCount: number;
};

export default class GameStatsLightbox {
  private group: Konva.Group;
  private textGrey: Konva.Text;
  private textGreen: Konva.Text;
  private textRed: Konva.Text;

  constructor(private opts: GameStatsLightboxOptions) {
    const { greyCount, greenCount, redCount } = opts;

    // main container group
    this.group = new Konva.Group({
      x: 10,
      y: 10,
      listening: false  //Avoid obstructing map interaction,(Dennis
    });

    const boxWidth = 160;
    const boxHeight = 80;

    // background box
    const background = new Konva.Rect({
      width: boxWidth,
      height: boxHeight,
      fill: "#f7f7f7",
      stroke: "#ccc",
      cornerRadius: 6,
    });

    // text fields
    this.textGrey = new Konva.Text({
      x: 10,
      y: 10,
      text: `Grey States: ${greyCount}`,
      fontSize: 14,
      fill: "#555",
    });

    this.textGreen = new Konva.Text({
      x: 10,
      y: 30,
      text: `Green States: ${greenCount}`,
      fontSize: 14,
      fill: "green",
    });

    this.textRed = new Konva.Text({
      x: 10,
      y: 50,
      text: `Red States: ${redCount}/${MAX_ERRORS}`, // from utils/constants, easier to edit.
      fontSize: 14,
      fill: "red",
    });

    // add elements to group
    this.group.add(background, this.textGrey, this.textGreen, this.textRed);
  }

  /** expose the Konva Group for external addition to a shared layer */
  public getGroup(): Konva.Group {
    return this.group;
  }

  /** update displayed counts */
  public updateCounts(grey: number, green: number, red: number): void {
    this.textGrey.text(`Grey States: ${grey}`);
    this.textGreen.text(`Green States: ${green}`);
    this.textRed.text(`Red States: ${red}/${MAX_ERRORS} `);

    // safely trigger redraw if the group is in a layer
    const layer = this.group.getLayer();
    if (layer) layer.draw();
  }

  /** clean up */
  public destroy(): void {
    this.group.destroy();
  }
}
