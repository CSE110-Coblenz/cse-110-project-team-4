// src/views/GameStatsLightbox.ts
/*=============================
  VIEW LAYER (MVC)
    Displays game statistics in the bottom-left HUD.
        - Renders Score, Found, Errors, and Remaining counts.
        - Provides navigation buttons (Home, Options, Help).
        - Uses ResizeObserver for responsive layout adjustment.

    Sprint 3 updates (Nov 2025):
    - Refactored text layout to a 2x2 grid for better alignment.
    - Added navigation buttons with callback support.
    - Implemented responsive positioning (bottom-aligned buttons).
    - Visual style update: larger fonts, transparent background.

    Public API:
    + constructor(opts: GameStatsLightboxOptions, width: number, height: number)
    + updateCounts(grey: number, green: number, red: number, points: number): void
    + resizeToStage(): void
    + getGroup(): Konva.Group
    + destroy(): void

    Update history: The original code is in the comment block at the bottom.
        Sprint 2 (Nov 2025):
        - Added points display to lightbox.
        - Updated updateCounts() to accept and display points parameter.
        - Adjusted layout height (80 -> 100) to accommodate points text.
        - Styled points text in blue with bold font.
==============================*/
import Konva from "konva";
import {MAX_ERRORS} from "../utils/constants";

export type GameStatsLightboxOptions = {
  greyCount: number;
  greenCount: number;
  redCount: number;
  points: number;
  onHome?: () => void;
  onOptions?: () => void;
  onHelp?: () => void;
};

const STYLE = {
  font: '"GameFont", "Segoe UI Black", "Arial Black", sans-serif',
  textDark: "#3d2b1f",
  blue: "#2c5d72",
  red: "#a63e3e",
  btnBg: "#e8dcb5",
  btnBorder: "#5a4632"
};

export default class GameStatsLightbox {
  private group: Konva.Group;
  private background: Konva.Rect;
  private navGroup: Konva.Group;
  // Label group
  private labelScore: Konva.Text;
  private labelFound: Konva.Text;
  private labelErrors: Konva.Text;
  private labelLeft: Konva.Text;

  private resizeObserver: ResizeObserver | null = null;

  constructor(private opts: GameStatsLightboxOptions, width: number = 450, height: number = 110) {
    const { greyCount, greenCount, redCount, points} = opts;

    this.group = new Konva.Group({ listening: true });

    this.background = new Konva.Rect({
      width: width,
      height: height,
      fill: 'transparent',
      stroke: "",
      cornerRadius: 10,
    });

    const col1X = 15;
    const col2X = 135; // Starting position of the right column
    const row1Y = 10;
    const row2Y = 32;  // The second row, Y coordinate
    const baseFontSize = 13; // fonts size

    // --- top left : SCORE ---
    this.labelScore = new Konva.Text({
      x: col1X, y: row1Y,
      text: `SCORE: ${points}`,
      fontSize: baseFontSize,
      fontFamily: STYLE.font,
      fill: STYLE.textDark,
      fontStyle: "bold"
    });

    // --- bottom left : FOUND ---
    this.labelFound = new Konva.Text({
      x: col1X, y: row2Y,
      text: `FOUND: ${greenCount}`,
      fontSize: baseFontSize,
      fontFamily: STYLE.font,
      fill: STYLE.textDark, 
      fontStyle: "bold"
    });

    // --- top right: ERRORS (red) ---
    this.labelErrors = new Konva.Text({
      x: col2X, y: row1Y,
      text: `ERRORS: ${redCount}/${MAX_ERRORS}`,
      fontSize: baseFontSize,
      fontFamily: STYLE.font,
      fill: STYLE.red, //red 
      fontStyle: "bold"
    });

    // --- bottom right : LEFT (Gray/Incomplete) ---
    this.labelLeft = new Konva.Text({
      x: col2X, y: row2Y,
      text: `LEFT: ${greyCount}`,
      fontSize: baseFontSize,
      fontFamily: STYLE.font,
      fill: "#7a6b5d", // or STYLE.textDark
      fontStyle: "bold"
    });

    // 2. Bottom half: Navigation buttons
    this.navGroup = new Konva.Group({ x: 15, y: 50 });
    this.createNavButton(0, "HOME", opts.onHome);
    this.createNavButton(82, "OPTIONS", opts.onOptions);
    this.createNavButton(164, "HELP", opts.onHelp);

    this.group.add(
        this.background, 
        this.labelScore, 
        this.labelFound, 
        this.labelErrors, 
        this.labelLeft, 
        this.navGroup
    );

    this.initResponsiveBehavior();
  }

  private initResponsiveBehavior() {
    setTimeout(() => {
        const stage = this.group.getStage();
        if (!stage) return;
        const container = stage.container();
        this.resizeObserver = new ResizeObserver(() => this.resizeToStage());
        this.resizeObserver.observe(container);
        this.resizeToStage();
    }, 50);
  }

  private createNavButton(x: number, label: string, onClick?: () => void) {
    const btnW = 75;
    const btnH = 28;
    const btnGroup = new Konva.Group({ x: x, y: 0 });
    
    const bg = new Konva.Rect({
      width: btnW, height: btnH,
      fill: STYLE.btnBg,
      stroke: STYLE.btnBorder,
      strokeWidth: 2,
      cornerRadius: 14,
      shadowColor: 'black',
      shadowBlur: 2,
      shadowOffset: {x: 1, y: 1},
      shadowOpacity: 0.2
    });

    const text = new Konva.Text({
      width: btnW, height: btnH,
      text: label,
      fontSize: 11,
      fontFamily: STYLE.font,
      fill: STYLE.textDark,
      align: 'center',
      verticalAlign: 'middle',
      fontStyle: 'bold',
      padding: 7
    });

    btnGroup.on('mousedown touchstart', () => { bg.y(1); bg.shadowOffset({x:0, y:0}); });
    btnGroup.on('mouseup touchend', () => { bg.y(0); bg.shadowOffset({x:1, y:1}); });
    btnGroup.on('mouseenter', () => { this.group.getStage()!.container().style.cursor = 'pointer'; });
    btnGroup.on('mouseleave', () => { this.group.getStage()!.container().style.cursor = 'default'; });

    if (onClick) btnGroup.on('click tap', onClick);

    btnGroup.add(bg, text);
    this.navGroup.add(btnGroup);
  }

  public getGroup(): Konva.Group {
    return this.group;
  }

  // update 4 labels 
  public updateCounts(grey: number, green: number, red: number, points: number): void {
    this.labelScore.text(`SCORE: ${points}`);
    this.labelFound.text(`FOUND: ${green}`);
    this.labelErrors.text(`ERRORS: ${red}/${MAX_ERRORS}`);
    this.labelLeft.text(`LEFT: ${grey}`);
    this.group.getLayer()?.batchDraw();
  }

  public resizeToStage(): void {
    const stage = this.group.getStage();
    if (!stage) return;

    const container = stage.container();
    const newW = container.clientWidth;
    const newH = container.clientHeight;

    if (newW === 0 || newH === 0) return;

    stage.width(newW);
    stage.height(newH);
    this.background.width(newW);
    this.background.height(newH);
  
    
    this.navGroup.y(newH - 28 - 12); // Bottom Alignment
    stage.batchDraw();
  }
  
  public destroy(): void { 
    if (this.resizeObserver) {
        this.resizeObserver.disconnect();
    }
    this.group.destroy(); 
  }
}



/* import Konva from "konva";
import {MAX_ERRORS} from "../utils/constants";

export type GameStatsLightboxOptions = {
  greyCount: number;
  greenCount: number;
  redCount: number;
  points: number;
};

export default class GameStatsLightbox {
  private group: Konva.Group;
  private textGrey: Konva.Text;
  private textGreen: Konva.Text;
  private textRed: Konva.Text;
  private textPoints: Konva.Text;

  constructor(private opts: GameStatsLightboxOptions) {
    const { greyCount, greenCount, redCount, points} = opts;

    // main container group
    this.group = new Konva.Group({
      x: 10,
      y: 10,
      listening: false  //Avoid obstructing map interaction,(Dennis
    });

    const boxWidth = 160;
    const boxHeight = 100;

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

    this.textPoints = new Konva.Text({
      x: 10,
      y: 70,
      text: `Points: ${points}`,
      fontSize: 14,
      fill: "#0066cc",
      fontStyle: "bold",
    });

    // add elements to group
    this.group.add(background, this.textGrey, this.textGreen, this.textRed, this.textPoints);
  }

  // expose the Konva Group for external addition to a shared layer
  public getGroup(): Konva.Group {
    return this.group;
  }

  // update displayed counts 
  public updateCounts(grey: number, green: number, red: number, points: number): void {
    this.textGrey.text(`Grey States: ${grey}`);
    this.textGreen.text(`Green States: ${green}`);
    this.textRed.text(`Red States: ${red}/${MAX_ERRORS} `);
    this.textPoints.text(`Points: ${points}`);

    // safely trigger redraw if the group is in a layer
    const layer = this.group.getLayer();
    if (layer) layer.draw();
  }

  // clean up
  public destroy(): void {
    this.group.destroy();
  }
} */