import { GAME_DURATION_MIN } from "../utils/constants";

export class TimerModel {
  private timerId: (number | null);
  private endAt: number;                      
  private onTick?: (secondsLeft: number) => void;
  private onDone?: () => void;

  constructor(private durationSeconds: number = GAME_DURATION_MIN * 60) {
    this.durationSeconds = durationSeconds;
    this.timerId = null;
    this.endAt = 0;
  }
  
  public get isRunning(): boolean { // Checks if timerId is active, otherwise it is null
    return this.timerId !== null;
  }

  public getTimeRemaining(): number {
    if (!this.isRunning) {
      return Math.max(0, this.durationSeconds);
    }
    const now = Date.now(); // current timestamp in ms
    return Math.max(0, Math.ceil((this.endAt - now) / 1000));
  }

  startTimer(onTick: (s: number) => void, onDone: () => void): void {
    if (this.isRunning) return; //Guard against multiple starts (continues if running)

    this.onTick = onTick;
    this.onDone = onDone;

    // Absolute deadline from curr timestamp + our duration
    this.endAt = Date.now() + this.durationSeconds * 1000;

    // Updates
    this.onTick?.(this.getTimeRemaining());

    this.timerId = window.setInterval(() => {
      const remaining = this.getTimeRemaining();
      this.onTick?.(remaining);
      if (remaining <= 0) this.stopTimer(); // will call onDone below
    }, 250); // smoother than 1000ms but still cheap
  }

  stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    // snap remaining to 0 and notify completion once
    this.onTick?.(0);
    this.onDone?.();
  }

  reset(durationSeconds?: number): void {
    if (durationSeconds !== undefined) this.durationSeconds = durationSeconds;
    if (this.isRunning) {
      // restart with new duration
      this.stopTimer();
      this.startTimer(this.onTick!, this.onDone!);
    }
  }
}
