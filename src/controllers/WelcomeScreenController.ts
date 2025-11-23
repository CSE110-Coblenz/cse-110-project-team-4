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
import { QuestionToggleController } from "./QuestionToggleController";
import { InfoCardView } from "../views/InfoCardView";
import { PopUpView } from "../views/PopUpView";
import { getDims } from "../utils/ViewUtils";
import { QuizManager } from "./QuizManager";
import { sanitize } from "../utils/NameValidator";

export class WelcomeScreenController {
    private view: WelcomeScreenView;
    private infoView: InfoCardView;
    private toggleController: QuestionToggleController;
    private ro: ResizeObserver;
    private containerID: string;
    private quiz: QuizManager;
    private popup: PopUpView;

    constructor(container: string, quiz: QuizManager) {
        this.view = new WelcomeScreenView(this.handleStart, this.handleInfo, this.handleOptions, container);
        this.toggleController = new QuestionToggleController(this.view.getStage(), container);
        this.infoView = new InfoCardView(this.view.getStage(), container, this.hideInfo);
        this.popup = new PopUpView(this.view.getLayer(), "Please enter your name\n in the input box below.");
        this.ro = new ResizeObserver(this.handleResize);
        this.ro.observe(document.getElementById(container)!);
        this.containerID = container;
        this.quiz = quiz;
    }

    // handler function when start button is clicked, should save name, initiate quiz
    handleStart = () => {
        let name = this.view.getInput().value;

        if (name === "") {
            this.popup.show()
            setTimeout(() => {this.popup.hide()}, 3000)
            return
        }

        name = sanitize(name)
        
        if (Object.keys(this.toggleController.getModel().getQuestions()).length === 0) {
            this.toggleController.initDefault();
        }

        this.quiz.startGame(name);
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
        this.popup.resize();
        this.view.getStage().width(w);
    }

    getView(): WelcomeScreenView {
        return this.view;
    }

    getToggler(): QuestionToggleController {
        return this.toggleController;
    }
}