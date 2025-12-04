import { TimerModel } from "../models/TimerModel";
import TimerViewCorner from "../views/TimerDisplayView";
import { ScreenSwitcher, Screens } from "../utils/types";

export class TimerController {
  private secondaryClock?: (seconds: number) => void;

  constructor(
    private model: TimerModel,
    private view: TimerViewCorner,
    private switcher: ScreenSwitcher
  ) {
    this.view.updateTimer(this.model.getTimeRemaining());
  }

  attachSecondaryDisplay(fn: (seconds: number) => void) {
    this.secondaryClock = fn;
    fn(this.model.getTimeRemaining());
  }

  start() {
    this.model.startTimer(
      (s) => {
        //Update Timer + secondary clock
        this.view.updateTimer(s);
        if (this.secondaryClock) {
          this.secondaryClock(s);
        }
      },
      () => {
        //Timer finishes
        this.view.updateTimer(0);
        if (this.secondaryClock) {
          this.secondaryClock(0);
        }
        this.switcher.switchToScreen(Screens.Leaderboard);
      }
    );
  }

  stop() {
    this.model.stopTimer();
  }

  isFinished() {
    return this.model.getTimeRemaining() === 0;
  }

  restartTimer(durationSeconds?: number) {
    this.model.reset(durationSeconds);
    const remaining = this.model.getTimeRemaining();
    this.view.updateTimer(remaining);
    if (this.secondaryClock) {
      this.secondaryClock(remaining);
    }
  }
}
