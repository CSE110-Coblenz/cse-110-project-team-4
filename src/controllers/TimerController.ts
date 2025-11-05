import { TimerModel } from "../models/TimerModel";
import TimerViewCorner from "../views/TimerDisplayView";

export class TimerController {
  constructor(private model: TimerModel, private view: TimerViewCorner) {
    this.view.updateTimer(this.model.getTimeRemaining());
  }

  start() {
    this.model.startTimer(
      (s) => this.view.updateTimer(s),   // onTick → update the label
      () => {
        this.view.updateTimer(0);
        // keep UI/UX here (not inside the model)
        alert("Time's up!!");
      }
    );
  }

  stop() {
    this.model.stopTimer();
  }
}
