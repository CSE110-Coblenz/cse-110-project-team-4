// src/services/LocalStorageManager.ts
// 
// 
/*=============================
  - Use LocalStorage to get, set, and clear leaderboard data
  - added in Sprint 2
  - still need to connect to Supabase

==============================*/

import type { LeaderboardEntry } from "../models/LeaderboardModel";

export class LocalStorageManager {
    private static LEADERBOARD_KEY = "leaderboardData";

    static saveLeaderboard(entries: LeaderboardEntry[]): void {
        try {
            localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(entries));
        } catch (err) {
            console.error("Error: could not save to leaderboard.", err);
        }
    }

    static loadLeaderboard(): LeaderboardEntry[] {
        try {
            const json = localStorage.getItem(this.LEADERBOARD_KEY);
            if (!json) {
                return [];
            }

            const data = JSON.parse(json);

            if (!Array.isArray(data)) {
                return [];
            }

            return data.filter(e =>
                e &&
                typeof e.score === "number" &&
                e.player && 
                typeof e.player.id === "number" &&
                typeof e.player.name === "string" &&
                typeof e.timestamp === "string"
            );
        } catch (err) {
            console.warn("LocalStorage error: returning empty leaderboard", err)
            return [];
        }
    }

    static clearLeaderboard(): void {
        localStorage.removeItem(this.LEADERBOARD_KEY);
    }
}
