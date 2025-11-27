// src/services/LeaderboardService.ts
import { supabase } from '../supabaseClient';
import type { LeaderboardEntry, Player } from '../models/LeaderboardModel';

type GameResultRow = {
    id: number;
    player_name: string;
    score: number;
    played_at: string;
    game_duration_seconds: number | null;
};

export class LeaderboardService {
    /**
     * Save a new game result to the database
     */
    static async saveScore(
        playerName: string, 
        score: number, 
        gameDurationSeconds: number | null
    ): Promise<boolean> {
        if (!supabase) {
            console.error('[LeaderboardService] Supabase not initialized');
            return false;
        }
    
        try {
            const { error } = await supabase
                .from('game_results')
                .insert({
                    player_name: playerName,
                    score: score,
                    played_at: new Date().toISOString(),
                    game_duration_seconds: gameDurationSeconds
                });
    
            if (error) {
                console.error('[LeaderboardService] Error saving score:', error);
                return false;
            }
    
            console.log(`[LeaderboardService] Score saved: ${playerName} - ${score} (${gameDurationSeconds}s)`);
            return true;
        } catch (err) {
            console.error('[LeaderboardService] Unexpected error:', err);
            return false;
        }
    }

    /**
     * Fetch top scores from the database
     */
    static async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
        if (!supabase) {
            console.error('[LeaderboardService] Supabase not initialized');
            return [];
        }
    
        try {
            const { data, error } = await supabase
                .from('game_results')
                .select('id, player_name, score, played_at, game_duration_seconds')
                .order('score', { ascending: false })
                .order('game_duration_seconds', { ascending: true }) // Faster time wins ties
                .limit(limit);
    
            if (error) {
                console.error('[LeaderboardService] Error fetching scores:', error);
                return [];
            }
    
            return (data as GameResultRow[] || []).map((row: GameResultRow) => {
                const duration = row.game_duration_seconds;
                const minutes = duration ? Math.floor(duration / 60) : 0;
                const seconds = duration ? duration % 60 : 0;
                const timeStr = duration ? `${minutes}:${seconds.toString().padStart(2, '0')}` : '--:--';
                
                return {
                    score: row.score,
                    player: {
                        id: row.id,
                        name: row.player_name
                    },
                    timestamp: timeStr // Show duration instead of date
                };
            });
        } catch (err) {
            console.error('[LeaderboardService] Unexpected error:', err);
            return [];
        }
    }
}