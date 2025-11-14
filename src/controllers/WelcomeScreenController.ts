// src/controllers/WelcomeScreenController.ts
/*==============================================================================
WelcomeScreenController

Public API
- constructor(container: string, switcher: ScreenSwitcher, quiz: QuizManager)
- handleStart() - initiates game
- handleInfo() - show info layer
- handleOptions() - show toggle layer
- handleResize()
- getView()
- getToggler()
- bindTimer() - fetches timer to save

Design Notes
- View handler functions implemented here for MVC

Related
- View: src/views/WelcomeScreenView.ts
- Sub Controller: src/controllers/QuestionToggleController.ts
- Sub View: src/views/InfoCardView.ts
==============================================================================*/

import { WelcomeScreenView } from "../views/WelcomeScreenView";
import { ScreenSwitcher, Screens } from "../utils/types";
import { QuestionToggleController } from "./QuestionToggleController";
import { InfoCardView } from "../views/InfoCardView";
import { getDims } from "../utils/ViewUtils";
import { TimerController } from "./TimerController";
import { QuizManager } from "./QuizManager";

export class WelcomeScreenController {
    private view: WelcomeScreenView;
    private switcher: ScreenSwitcher;
    private infoView: InfoCardView;
    private toggleController: QuestionToggleController;
    private timer?: TimerController;
    private ro: ResizeObserver;
    private containerID: string;
    private quiz: QuizManager;

    constructor(container: string, switcher: ScreenSwitcher, quiz: QuizManager) {
        this.view = new WelcomeScreenView(this.handleStart, this.handleInfo, this.handleOptions, container);
        this.switcher = switcher;
        this.toggleController = new QuestionToggleController(this.view.getStage(), container);
        this.infoView = new InfoCardView(this.view.getStage(), container, this.hideInfo);
        this.ro = new ResizeObserver(this.handleResize);
        this.ro.observe(document.getElementById(container)!);
        this.containerID = container;
        this.quiz = quiz;
    }

    // handler function when start button is clicked, should save name
    handleStart = () => {
        let inputEl = document.getElementById("nameInput");
        if (inputEl) {
            let name = (<HTMLInputElement>inputEl).value;
            this.quiz.setName(name);
            // validate the user's name
        }

        if (Object.keys(this.toggleController.getModel().getQuestions()).length === 0) {
            this.toggleController.initDefault();
        }

        if (this.timer) {
            this.timer.start();
        }
        this.switcher.switchToScreen(Screens.Map);

        setTimeout(() => {this.quiz.handleNextAction()}, 200);
    }

    // route info click to info screen, maybe display a modal instead?
    handleInfo = () => {
        this.view.getInput().style.display = "none";
        this.infoView.show();
    }

    hideInfo = () => {
        this.view.getInput().style.display = "block";
        this.infoView.hide();
    }

    // route options click to options screen
    handleOptions = () => {
        this.view.getInput().style.display = "none";
        this.toggleController.getView().show();
    }

    handleResize = () => {
        let [w, h] = getDims(360, 360, this.containerID);
        this.view.resize();
        this.toggleController.handleResize();
        this.infoView.resize();
        this.view.getStage().width(w);
    }

    getView(): WelcomeScreenView {
        return this.view;
    }

    getToggler(): QuestionToggleController {
        return this.toggleController;
    }

    bindTimer(timer: TimerController): void {
        this.timer = timer;
    }
}