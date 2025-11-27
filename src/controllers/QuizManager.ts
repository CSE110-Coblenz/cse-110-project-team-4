// src/controllers/QuizManager.ts
/*==============================================================================
QuizManager

Public API
- constructor(switcher: ScreenSwitcher)
- init(questionBank: QuestionBankModel, stats: GameStatsController, timer: TimerController, map: MapController) - connects manager to dependent components
- getNextQuestion() - returns random question and updates bank
- getIncorrectQuestion(state: string, type: string) - returns incorrect answers given state/type 
- startGame(name: string)
- getStatus() - return whether init has been called
- getQuestionBank() - returns model
- restartGame() 
- handleNextAction() - checks if game is over, then acts appropriately

Related
- Model: src/models/QuestionBankModel.ts
==============================================================================*/

import { QuestionBankModel, BankJSON } from "../models/QuestionBankModel";
import { ALL_STATES } from "../utils/constants";
import { FULL_NAME_BY_CODE } from "../data/maps/UsCodeToName"; 
import { Question, QuestionType, Answer, AnswerStatus } from "../models/Questions";
import { GameStatsController } from "./GameStatsController";
import { UIController } from "./UIController";
import { TimerController } from "./TimerController";
import { ScreenSwitcher, Screens } from "../utils/types";
import { MapController } from "./MapController";
import { StateStatus } from "../models/State";

export class QuizManager {
    private questionBank?: QuestionBankModel;
    private hasInit: boolean;
    private name?: string; // eventually save this into database
    private stats?: GameStatsController;
    private ui?: UIController
    private continue: boolean;
    private timer?: TimerController;
    private switcher: ScreenSwitcher;
    private map?: MapController;

    constructor(switcher: ScreenSwitcher) {
        this.hasInit = false;
        this.continue = true;
        this.switcher = switcher;
    }

    public init(
        questionBank: QuestionBankModel, 
        stats: GameStatsController, 
        ui: UIController, 
        timer: TimerController,
        map: MapController) 
    {
        this.hasInit = true;
        this.questionBank = questionBank;
        this.stats = stats;
        this.ui = ui
        this.continue = true;
        this.timer = timer;
        this.map = map;
    }

    /** gets and returns info necessary for one question, removing that state from the pool
     * return format:
     * {question state name, question type, correct answer, [wrong ans, wrong ans, wrong ans]}
     */
    getNextQuestion(): Question | null {
        if (this.questionBank == null) {
            return null;
        }
        let questions: BankJSON = this.questionBank.getQuestions();
        // check that questions have been initialized + at least 1 state remains
        if (Object.keys(questions).length == 0 || this.questionBank.getRemainingStates().length == 0) {
            return null;
        }

        // choose random state name + question type
        let randomIndex: number = Math.floor(Math.random() * Object.keys(questions).length);
        let randomStateIndex: number = Math.floor(Math.random() * this.questionBank.getRemainingStates().length);
        let randomType: string = Object.keys(questions)[randomIndex];
        let randomState: string = this.questionBank.getRemainingStates()[randomStateIndex];
        this.questionBank.removeRemainingStates(randomStateIndex);

        let typeString: string = "";
        // adapter for json key to QuestionType
        let qType: QuestionType = QuestionType.Capital;
        let useDateFormat = false;
        switch (randomType) {
            case "capitalQuestions":
                qType = QuestionType.Capital;
                typeString = "capital";
                break;
            case "flowerQuestions":
                qType = QuestionType.Flower;
                typeString = "state flower";
                break;
            case "abbreviationQuestions":
                qType = QuestionType.Abbreviation;
                typeString = "abbreviation";
                break;
            case "dateQuestions":
                qType = QuestionType.Date;
                useDateFormat = true;
                break;
            default:
                typeString = "no type found"
        }
        let questionString: string;
        if (useDateFormat) {   
            questionString = `What year was ${randomState} added to the union?`;
        } else {
            questionString = `What is the ${typeString} for ${randomState}?`;
        }

        let answer: Answer = {
            answerText: questions[randomType][randomState],
            status: AnswerStatus.NotSelected
        }
    
        return new Question(randomState, qType, questionString, answer);
    }

    getIncorrectAnswers(state: string, type: string): Answer[] | null {
        if (this.questionBank == null) {
            return null;
        }
        let incorrectAnswers: Answer[] = [];

        let tempStates: string[] = [...ALL_STATES];
        let idx = tempStates.indexOf(state)
        if (idx < 0) {
            return null;
        }
        tempStates.splice(idx, 1);

        // choose 3 of the 49 non-correct states to grab fake answers from
        incorrectAnswers = [];
        for (let i = 0; i < 3; i++) {
            let idx: number = Math.floor(Math.random() * tempStates.length);
            let stateName: string = tempStates[idx];
            tempStates.splice(idx, 1);
            if (Object.keys(this.questionBank.getQuestions()).indexOf(type) === -1) {
                return null;
            }
            let ans: Answer = {
                answerText: this.questionBank.getQuestions()[type][stateName],
                status: AnswerStatus.NotSelected
            }
            if (ans.answerText === this.questionBank.getQuestions()[type][state]) {
                console.log("duplicate answer found, rerolling");
                i--;
                continue;
            }
            incorrectAnswers.push(ans);
        }

        return incorrectAnswers;
    }

    startGame(name: string) {
        this.name = name;
        if (this.timer) {
            this.timer.start();
        }
        this.switcher.switchToScreen(Screens.Map);
        this.handleNextAction();
    }

    public getStatus(): boolean {
        return this.hasInit;
    }

    public getQuestionBank(): QuestionBankModel | null {
        if (this.questionBank) {
            return this.questionBank;
        }
        return null;
    }

    public restartGame(): void {
        Object.keys(FULL_NAME_BY_CODE).forEach(key => {
            this.map?.getStore().setStatus(key, StateStatus.NotStarted);
        })
        this.map?.getStore()
        this.stats?.updateCounts(51, 0, 0, 0)
        this.continue = true;
        this.questionBank?.resetRemainingStates();
        this.stats?.resetPoints();
        // road car dashboard
        this.ui?.resetRoadTripHud();
    }

    public handleNextAction(): void {
        if (!this.hasInit || !this.ui || !this.questionBank || !this.stats || !this.timer) {
            return;
        }

        let finishedStatus = this.stats.isFinished();
        if (this.questionBank.getRemainingStates().length == 0 || finishedStatus != 0) {
            this.continue = false;
        }


        if (this.continue) {
            this.ui.goToQuestionsFor();
        } else {
            this.ui?.disableMap();
            // this.timer?.stop(); <-- uncomment this once timer alerts are fixed
            switch (finishedStatus) {
                case 1:
                    console.log("victory royale")
                    this.ui?.triggerFireworks();
                    break;
                case 0:
                    console.log("probably ran out of time")
                    break;
                case -1:
                    console.log("this is loss")
                    break
            }
            setTimeout(() => {this.switcher.switchToScreen(Screens.Leaderboard)}, 5000);
        }
    }
}