// src/models/StateStore.ts
/*=============================
    MODEL LAYER: 
    Minimal in-memory repository for US states.
    - Holds state records (Map)
    - Publishes updates to subscribers: pub/sub
===============================
    A replaceable abstraction: 
        Later, swap internals without changing callers.  (such as "localStorage") 
*/

import { StateStatus, USState } from "./State"; //import state.ts

type Listener = () => void;

export class StateStore {
    private states = new Map<string, USState>();   // e.g.key = state code ("CA"), value = USState
    private listeners: Listener[] = [];  // Subscribers notified on every mutation (simple pub/sub)

    constructor(seed: Array<USState>) {
        seed.forEach(s => this.states.set(s.code, s));     // Initialize the store with seed data
    }

    // Read all states as a plain array (stable API for views/controllers)
    public getAll(): USState[] {
        return Array.from(this.states.values());
    }

    // Read one state by code; undefined if not found (caller handles it)
    public get(code: string): USState | undefined {
        return this.states.get(code);
    }

    // Write: update only the `status` field (immutable update pattern)
    public setStatus(code: string, status: StateStatus): void {
        const cur = this.states.get(code);
        if (!cur) return;                 // No-op if code is invalid
        this.states.set(code, { ...cur, status });
        this.emit();                      // Notify all subscribers
    }

    // Observer / Pub-Sub
    // Subscribe to changes; returns an unsubscribe function (cleanup on unmount)
    // Notify all subscribers (simple synchronous fan-out)
    public subscribe(fn: Listener): () => void {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }
    private emit() {
        this.listeners.forEach(l => l());
    }
}
