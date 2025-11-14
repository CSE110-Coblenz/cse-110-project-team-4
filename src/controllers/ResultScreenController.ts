import { QuizManager } from "./QuizManager";
import { ResultScreenView } from "../views/ResultScreenView";
import { ScreenSwitcher, Screens } from "../utils/types";

export class ResultScreenController {
    private view: ResultScreenView;
    private quiz: QuizManager;
    private switcher: ScreenSwitcher;
    private ro: ResizeObserver;

    constructor(quiz: QuizManager, switcher: ScreenSwitcher, container: string) {
        this.quiz = quiz;
        this.view = new ResultScreenView(this.handleRestart, container);
        this.switcher = switcher;

        this.ro = new ResizeObserver(this.handleResize);
        this.ro.observe(document.getElementById(container)!);
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