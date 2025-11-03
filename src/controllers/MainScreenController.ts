import { MainScreenView } from "../views/MainScreenView";
import { ScreenSwitcher, Screens } from "../utils/types";
import { QuestionToggleController } from "./QuestionToggleController";

export class MainScreenController {
    private view: MainScreenView;
    private switcher: ScreenSwitcher;
    private toggleController: QuestionToggleController;

    constructor(container: string, switcher: ScreenSwitcher) {
        this.view = new MainScreenView(this.handleStart, this.handleInfo, this.handleOptions, container);
        this.switcher = switcher;
        this.toggleController = new QuestionToggleController(this.view.getStage());
    }

    // handler function when start button is clicked, should save name
    handleStart = () => {
        let inputEl = document.getElementById("nameInput");
        if (inputEl) {
            let name = (<HTMLInputElement>inputEl).value;
            console.log("we should save this name:", name);
            // validate the user's name
            // call an init function on the quiz manager, with the user's name
        }
        this.switcher.switchToScreen(Screens.Map);
    }

    // route info click to info screen, maybe display a modal instead?
    handleInfo = () => {
        this.switcher.switchToScreen(Screens.Info);
    }

    // route options click to options screen
    handleOptions = () => {
        this.view.getInput().style.display = "none";
        this.toggleController.getView().show();
    }

    getView(): MainScreenView {
        return this.view;
    }
}