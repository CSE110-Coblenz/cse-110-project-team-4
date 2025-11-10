export interface MatchCard {
  id: string;         // unique per card
  label: string;      // what to show when flipped (img)
  isFlipped: boolean;
  isMatched: boolean;
}

export class MatchGameModel {
    public DisplayCards: MatchCard[] = [];
    public matchesFound = 0; // For our score

    startMiniGame(): void {
        this.matchesFound = 0;
        this.DisplayCards = this.generateShuffledCards();
        console.log("Minigame started. Cards:", this.DisplayCards);
    }

    // Need to determine if shuffle works first
    private generateShuffledCards(): MatchCard[] {
        const cardImg = ["🍎", "🍎", "🥝", "🥝", "🍐", "🍐", "🍅", "🍅", "🍓", "🍓", "🍈", "🍈", "🍇", "🍇", "🫒", "🫒"];
        const shuffled = shuffleArray(cardImg); // string[]

        return shuffled.map((label, index) => ({
            id: `card-${index}`,
            label,
            isFlipped: false,
            isMatched: false,
        }));
    }
}

// Fisher–Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const arr = array.slice(); // copy
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}           

// Testing
const newGame = new MatchGameModel();
newGame.startMiniGame();