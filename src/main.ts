// src/main.ts
/*=============================
  APP ENTRY:
  Compose Model + Controller + UI; mount the map.
    Seeds demo data
    Hooks keyboard shortcuts for quick testing
==============================*/
// For test, plz feel free to modifty / add something.
// App entrypoint: initialize Model, Controller, and View. Keep sync and structure clear.

import { StateStatus, USState } from "./models/State";
import { StateStore } from "./models/StateStore";
import { MapController } from "./controllers/MapController";
import { UIController } from "./controllers/UIController";

/**
 * seed: minimal demo data for all 50 states. Replace with persisted data late
 */
const seed: USState[] = Object.keys({
    WA:1, OR:1, CA:1, ID:1, NV:1, AZ:1, UT:1, CO:1, NM:1,
    MT:1, WY:1, ND:1, SD:1, NE:1, KS:1, OK:1, TX:1,
    MN:1, IA:1, MO:1, WI:1, IL:1, AR:1, LA:1,
    MI:1, IN:1, KY:1, TN:1, MS:1, AL:1, GA:1, FL:1, SC:1, NC:1,
    VA:1, WV:1, OH:1, PA:1, NY:1, NJ:1, MD:1, DE:1, CT:1, RI:1, MA:1, VT:1, NH:1, ME:1, DC:1,
    AK:1, HI:1
}).map(code => ({
    code,
    name: code,
    status: StateStatus.NotStarted
}));

const store = new StateStore(seed);
const ui = new UIController();
const map = new MapController(store, ui);
map.mount("map-container");

// Testing state color
setTimeout(() => store.setStatus("CA", StateStatus.Complete), 1000);
setTimeout(() => store.setStatus("TX", StateStatus.Partial), 1500);
