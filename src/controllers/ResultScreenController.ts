// src/controllers/ResultScreenController.ts
/*==============================================================================
ResultScreenController

Public API
- constructor(quiz: QuizManager, switcher: ScreenSwitcher, container: string)
- handleRestart() - conveys to quiz manager to restart quiz
- getView()
- handleREsize()

Related
- View: src/views/ResultScreenView.ts
==============================================================================*/

import { QuizManager } from "./QuizManager";
import { ResultScreenView } from "../views/ResultScreenView";
import { ScreenSwitcher, Screens } from "../utils/types";
import { LeaderboardView } from "../views/LeaderboardView";
import { LeaderboardEntry, Player } from "../models/LeaderboardModel";
import { LeaderboardService } from "../services/LeaderboardService";

export class ResultScreenController {
  private view: ResultScreenView;
  private quiz: QuizManager;
  private switcher: ScreenSwitcher;
  private ro: ResizeObserver;
  private leaderboard: LeaderboardView;

  constructor(quiz: QuizManager, switcher: ScreenSwitcher, container: string) {
    this.quiz = quiz;
    this.view = new ResultScreenView(this.handleRestart, container);
    this.leaderboard = new LeaderboardView();
    this.switcher = switcher;

    this.ro = new ResizeObserver(this.handleResize);
    this.ro.observe(document.getElementById(container)!);

    // Attach leaderboard view to layer
    this.view.getLayer().add(this.leaderboard.getGroup());

    // Load real leaderboard data
    this.loadLeaderboard();
  }

  // Add method to load and display leaderboard
  private async loadLeaderboard(): Promise<void> {
    const entries = await LeaderboardService.getTopScores(5);

    if (entries.length > 0) {
      this.leaderboard.draw(entries);
    } else {
      // Show empty state if no scores yet
      console.log("No scores yet. leaderboard is empty");
      this.leaderboard.draw([]);
    }
  }

  // Add public method to refresh leaderboard when screen is shown
  public refreshLeaderboard(): void {
    this.loadLeaderboard();
  }

  handleRestart = () => {
    this.quiz.restartGame();
    this.switcher.switchToScreen(Screens.Welcome);
  };

  getView(): ResultScreenView {
    return this.view;
  }

  handleResize = () => {
    this.view.resize();
  };
}
