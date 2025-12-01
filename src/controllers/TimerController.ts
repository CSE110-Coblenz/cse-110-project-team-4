import { TimerModel } from "../models/TimerModel";
import TimerViewCorner from "../views/TimerDisplayView";
import { ScreenSwitcher, Screens } from "../utils/types";

export class TimerController {
  constructor(
    private model: TimerModel,
    private view: TimerViewCorner,
    private switcher: ScreenSwitcher
  ) {
    this.view.updateTimer(this.model.getTimeRemaining());
  }

  start() {
    console.log("TimerController: Starting timer");
    this.model.startTimer(
      (s) => {
        console.log("TimerController: Tick - seconds remaining:", s);
        this.view.updateTimer(s);
      },
      () => {
        console.log("TimerController: onDone callback fired!");
        console.log("TimerController: Switcher exists?", !!this.switcher);
        this.view.updateTimer(0);
        console.log("TimerController: About to switch to leaderboard");
        this.switcher.switchToScreen(Screens.Leaderboard);
        console.log("TimerController: Switch command sent");
      }
    );
  }

  stop() {
    this.model.stopTimer();
  }

  isFinished() {
    return this.model.getTimeRemaining() === 0;
  }
}
