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
        
        // mock a leaderboard entry for demo purposes
        let mockPlayer: Player = {
            id: 42,
            name: "hal"
        }
        let mockEntry: LeaderboardEntry = {
            score: 100,
            player: mockPlayer,
            timestamp: "now"
        }

        // attach leaderboard to results screen directly for demo purposes, maybe will change later
        this.leaderboard.draw([mockEntry])
        this.view.getLayer().add(this.leaderboard.getGroup())
    }

    handleRestart = () => {
        this.quiz.restartGame();
        this.switcher.switchToScreen(Screens.Welcome);
    }

    getView(): ResultScreenView {
        return this.view;
    }

    handleResize = () => {
        this.view.resize();
    }
}