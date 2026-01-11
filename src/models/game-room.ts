export default class GameRoom {
  id: string;
  players: Map<string, string>;
  board: (string | null)[];
  currentTurn: string;
  winner: string | null;
  isFull: boolean;
  createdAt: Date;

  constructor(id: string) {
    this.id = id;
    this.players = new Map();
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.winner = null;
    this.isFull = false;
    this.createdAt = new Date();
  }

  addPlayer(playerId: string, playerName: string): boolean {
    if (this.players.size >= 2) return false;
    this.players.set(playerId, playerName);
    if (this.players.size === 2) this.isFull = true;
    return true;
  }

  makeMove(playerId: string, position: number): boolean {
    const playerSymbol = Array.from(this.players.keys())[0] === playerId ? 'X' : 'O';
    
    if (playerSymbol !== this.currentTurn) return false;
    if (this.board[position] !== null) return false;
    if (this.winner) return false;

    this.board[position] = playerSymbol;
    this.winner = this.calculateWinner();
    
    if (!this.winner && this.board.every(cell => cell !== null)) {
      this.winner = 'draw';
    } else if (!this.winner) {
      this.currentTurn = playerSymbol === 'X' ? 'O' : 'X';
    }

    return true;
  }

  private calculateWinner(): string | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    return null;
  }

  reset(): void {
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.winner = null;
  }
}
