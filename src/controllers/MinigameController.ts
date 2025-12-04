import { GameStatsController } from "./GameStatsController";
import { TimerController } from "./TimerController";
import { ScreenSwitcher, Screens } from "../utils/types";

let scoreResult = 0;

export class MinigameController {
  private maxMatches = 8;
  private pickedCards: { index: number; emoji: string }[] = [];
  private cardElements: NodeListOf<HTMLElement> | null = null;
  private container: HTMLElement | null = null;

  constructor(
    private stats: GameStatsController,
    private switcher: ScreenSwitcher,
    private timer: TimerController
  ) {}

  public mount(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    this.container = container;
    const backButton = container.querySelector(
      "#minigame-back-button"
    ) as HTMLButtonElement | null;

    if (backButton) {
      backButton.onclick = () => {
        this.switcher.switchToScreen(Screens.Map);
      };
    } else {
      console.warn("#minigame-back-button not found inside minigame-root");
    }

    this.initializeGame();
  }

  private initializeGame(): void {
    if (!this.container) {
      return;
    }
    const grid = this.container.querySelector(
      ".minigame-stage"
    ) as HTMLDivElement;
    const scoreDisplay = this.container.querySelector("#score") as HTMLElement;
    const timerDisplay = this.container.querySelector(
      "#minigame-timer"
    ) as HTMLElement;
    if (!grid || !scoreDisplay || !timerDisplay) {
      return;
    }

    //--------------- Reset game state ---------------//
    grid.innerHTML = "";
    this.pickedCards = [];
    this.cardElements = null;
    scoreResult = 0;
    scoreDisplay.innerText = "0";

    const btn = document.getElementById("minigame-button");
    // if (btn) {
    //   btn.hidden = true;
    //   console.log("Hiding minigame button");
    // }

    this.timer.attachSecondaryDisplay((seconds) => {
      timerDisplay.innerText = this.formatMiniGameTime(seconds);
    });

    let cardImg = [
      "🍎",
      "🍎",
      "🥝",
      "🥝",
      "🍐",
      "🍐",
      "🍅",
      "🍅",
      "🍓",
      "🍓",
      "🍈",
      "🍈",
      "🍇",
      "🍇",
      "🫒",
      "🫒",
    ];

    // Shuffle cards
    cardImg = this.shuffleArray(cardImg);

    // Create cards
    cardImg.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.dataset.imgValue = card;
      cardElement.innerText = card;
      grid.appendChild(cardElement);
    });

    // Click handlers
    this.clickHandlers();
  }

  private clickHandlers(): void {
    this.cardElements = document.querySelectorAll(
      ".card"
    ) as NodeListOf<HTMLElement>;

    this.cardElements.forEach((card) => {
      card.addEventListener("click", () => {
        if (
          this.pickedCards.length >= 2 ||
          card.classList.contains("flipped")
        ) {
          return;
        } else {
          card.classList.add("flipped");
          const cardValue = card.dataset.imgValue as string;
          const cardIndex = Array.from(this.cardElements!).indexOf(card);
          this.pickedCards.push({ index: cardIndex, emoji: cardValue });
        }

        if (this.pickedCards.length === 2) {
          setTimeout(() => {
            this.checkForMatch();
          }, 500);
        }
      });
    });
  }

  private checkForMatch(): void {
    const card1 = this.pickedCards[0];
    const card2 = this.pickedCards[1];

    // // Case 1: 2 different cards are picked and they match
    if (
      this.pickedCards.length >= 2 &&
      card1.index !== card2.index &&
      card1.emoji === card2.emoji
    ) {
      scoreResult++;
      this.stats.addPoints(10);
      this.pickedCards.pop();
      this.pickedCards.pop();

      const scoreDisplay = document.querySelector("#score") as HTMLElement;
      if (scoreDisplay) {
        scoreDisplay.innerText = scoreResult.toString();
      }

      // Check if all pairs matched in minigame
      if (scoreResult >= this.maxMatches) {
        this.endMinigame();
      }
    }

    // Case 2: 2 different cards are picked and they don't match
    else if (
      this.pickedCards.length >= 2 &&
      card1.index !== card2.index &&
      card1.emoji !== card2.emoji
    ) {
      if (this.cardElements) {
        this.cardElements[card1.index].classList.remove("flipped");
        this.cardElements[card2.index].classList.remove("flipped");
      }
      this.pickedCards.pop();
      this.pickedCards.pop();
    }
  }

  private endMinigame(): void {
    if (this.cardElements) {
      this.cardElements.forEach((card) => {
        card.style.pointerEvents = "none"; // Make it not interactive
      });
    }

    setTimeout(() => {
      this.switcher.switchToScreen(Screens.Map);
    }, 100);
  }

  private shuffleArray(array: string[]): string[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private formatMiniGameTime(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }

  public restart(): void {
    console.log("Restarting minigame");
    if (!this.container) {
      return;
    }

    if (this.cardElements) { //Make the cards interactive again
      this.cardElements.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
    }

    this.initializeGame();
  }
}
