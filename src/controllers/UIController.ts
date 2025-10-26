// src/controllers/UIController.ts
/*=============================
  UI BUS / NAV LAYER:
  Minimal UI facade for frist demos.
    Logs navigation intent (visual panel)
    Updates location hash (observable effect for tests)
==============================*/
// A minimal UI bus,just for test: only one method to navigate to the Questions screen.
// Later replace this with a real router / ScreenSwitcher.
import { USState } from "../models/State";

export class UIController {
    public goToQuestionsFor(state: USState) {
    // Replace the next line later with: ScreenSwitcher.showQuestions(state) 
    console.log(`Go to Questions for: ${state.code} - ${state.name}`);
    }
}