// src/controllers/QuizManager.ts
/*==============================================================================
QuizManager

Public API
- constructor()
- init(questionBank: QuestionBankModel, stats: GameStatsController, timer: TimerController, map: MapController) - connects bank to manager due to creation order
- getNextQuestion() - returns random question and updates bank
- getIncorrectQuestion(state: string, type: string) - returns incorrect answers given state/type 
- setName(name: string)
- getStatus() - return whether init has been called
- getQuestionBank() - returns model
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
import { finished } from "stream";
import { MapController } from "./MapController";
import { StateStatus } from "../models/State";

export class QuizManager {
    private questionBank?: QuestionBankModel;
    private hasInit: boolean;
    private name?: string;
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
        console.log("INIT SUCCESSFUL", questionBank);
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
            default:
                typeString = "no type found"
        }
        let questionString: string = `What is the ${typeString} for ${randomState}?`;

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
        tempStates.splice(tempStates.indexOf(state), 1);

        // choose 3 of the 49 non-correct states to grab fake answers from
        incorrectAnswers = [];
        for (let i = 0; i < 3; i++) {
            let idx: number = Math.floor(Math.random() * tempStates.length);
            let stateName: string = tempStates[idx];
            tempStates.splice(idx, 1);
            let ans: Answer = {
                answerText: this.questionBank.getQuestions()[type][stateName],
                status: AnswerStatus.NotSelected
            }
            incorrectAnswers.push(ans);
        }

        return incorrectAnswers;
    }

    setName(name: string) {
        this.name = name;
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
    }

    public handleNextAction(): void {
        if (!this.hasInit || !this.ui || !this.questionBank || !this.stats || !this.timer) {
            return;
        }

        let finishedStatus = this.stats.isFinished();
        if (this.questionBank.getRemainingStates().length == 0 ||
                finishedStatus != 0 ||
                this.timer.isFinished()) {
            this.continue = false;
        }

        if (this.continue) {
            this.ui.goToQuestionsFor();
        } else {
            switch (finishedStatus) {
                case 1:
                    console.log("victory royale")
                    break;
                case 0:
                    console.log("probably ran out of time")
                    break;
                case -1:
                    console.log("this is loss")
                    break
            }
            this.switcher.switchToScreen(Screens.Leaderboard);
        }
    }
}