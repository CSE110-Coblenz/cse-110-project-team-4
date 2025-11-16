// src/models/LeaderboardModel.ts
/*=============================
    MODEL LAYER: 
    Domain types for the Leaderboard. 
*/

export type Player = {
    id: number;
    name: string;
}

// Represents a single leaderboard entry
export type LeaderboardEntry = {
	score: number;
    player: Player;    // possibly a placeholder, assuming we plan on handling this more safely
	timestamp: string; // should be formatted correctly on view
};

// LeaderboardModel - Stores leaderboard entry list
export class LeaderboardModel {
	private leaderboard: LeaderboardEntry[] = [];
	private storageKey = "leaderboardData";

    
	// Set the leaderboard entries
	setLeaderboard(entries: LeaderboardEntry[]): void {
		this.leaderboard = [...entries];
	}

    // Get the leaderboard entries
	getLeaderboard(): LeaderboardEntry[] {
		return [...this.leaderboard];
	}

	getLeaderboardSorted(): LeaderboardEntry[] {
		return [...this.leaderboard].sort((a, b) => b.score - a.score);
	}

	addEntry(entry: LeaderboardEntry): void {
		this.leaderboard.push(entry);
	}
}


