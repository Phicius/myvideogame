import GameRoom from '../models/game-room';

const API_URL = 'http://localhost:3001/gameRooms';

export default class GameRoomService {

  static async createRoom(): Promise<string> {
    const roomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newRoom = {
      id: roomId,
      players: [],
      board: Array(9).fill(null),
      currentTurn: 'X',
      winner: null,
      createdAt: new Date().toISOString(),
    };

    try {
      console.log(`🏗️ [createRoom] Création salle: ${roomId}`);
      console.log(`🏗️ [createRoom] POST vers ${API_URL}`, newRoom);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      });
      
      if (response.ok) {
        const createdRoom = await response.json();
        console.log(`✅ [createRoom] Salle créée en BDD: ${roomId}`, createdRoom);
        return roomId;
      } else {
        console.error(`❌ [createRoom] Erreur POST: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [createRoom] Erreur:', error);
    }
    return roomId;
  }

  static async getRoom(roomId: string): Promise<any> {
    try {
      // Méthode 1: Chercher par le champ id personnalisé
      console.log(`🔍 Recherche salle "${roomId}" en BDD...`);
      
      // Récupérer toutes les salles et filtrer localement
      const allRoomsResponse = await fetch(`${API_URL}`);
      if (allRoomsResponse.ok) {
        const allRooms = await allRoomsResponse.json();
        const foundRoom = allRooms.find((r: any) => r.id === roomId);
        
        if (foundRoom) {
          console.log(`✓ Salle trouvée: "${roomId}"`);
          return foundRoom;
        }
      }
      
      console.log(`✗ Salle non trouvée: "${roomId}"`);
    } catch (error) {
      console.error('❌ Erreur recherche salle:', error);
    }
    return null;
  }

  static async joinRoom(roomId: string, playerId: string, playerName: string): Promise<boolean> {
    try {
      console.log(`🔍 [joinRoom] Recherche salle: ${roomId}`);
      const room = await this.getRoom(roomId);
      
      if (!room) {
        console.error(`❌ [joinRoom] Salle "${roomId}" non trouvée`);
        return false;
      }

      console.log(`📊 [joinRoom] État de la salle ${roomId}: ${room.players.length} joueurs`);

      // Vérifier si le joueur n'est pas déjà dans la salle
      if (room.players.some((p: any) => p.id === playerId)) {
        console.log(`ℹ️ [joinRoom] ${playerName} est déjà dans la salle`);
        return true;
      }

      if (room.players.length >= 2) {
        console.error(`❌ [joinRoom] Salle "${roomId}" pleine (${room.players.length}/2)`);
        return false;
      }

      // Ajouter le joueur
      room.players.push({ id: playerId, name: playerName });
      console.log(`✏️ [joinRoom] Joueur ajouté localement: ${playerName}. Total: ${room.players.length}`);

      // Utiliser PUT avec l'ID de la salle (Express serveur)
      console.log(`📤 [joinRoom] PUT vers ${API_URL}/${roomId}`);
      const response = await fetch(`${API_URL}/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });

      if (response.ok) {
        console.log(`✅ [joinRoom] ${playerName} a rejoint ${roomId}. Joueurs: ${room.players.length}/2`);
        return true;
      } else {
        console.error(`❌ [joinRoom] Erreur PUT: réponse non-ok (${response.status})`);
      }
    } catch (error) {
      console.error('❌ [joinRoom] Erreur:', error);
    }
    return false;
  }

  static async makeMove(roomId: string, playerId: string, position: number): Promise<boolean> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      // Vérifier le tour du joueur
      const playerIndex = room.players.findIndex((p: any) => p.id === playerId);
      const expectedTurn = playerIndex === 0 ? 'X' : 'O';

      if (room.currentTurn !== expectedTurn) {
        console.error(`❌ Ce n'est pas votre tour`);
        return false;
      }

      if (room.board[position] !== null) {
        console.error(`❌ Case occupée`);
        return false;
      }

      // Faire le coup
      room.board[position] = expectedTurn;

      // Vérifier la victoire
      const winner = this.calculateWinner(room.board);
      if (winner) {
        room.winner = winner;
      } else if (room.board.every((cell: any) => cell !== null)) {
        room.winner = 'draw';
      } else {
        room.currentTurn = expectedTurn === 'X' ? 'O' : 'X';
      }

      const response = await fetch(`${API_URL}/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Erreur move:', error);
    }
    return false;
  }

  static async resetGame(roomId: string): Promise<boolean> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      room.board = Array(9).fill(null);
      room.currentTurn = 'X';
      room.winner = null;

      const response = await fetch(`${API_URL}/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Erreur reset:', error);
    }
    return false;
  }

  static async getRoomState(roomId: string): Promise<any> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    return {
      id: room.id,
      players: room.players.map((p: any) => p.name),
      board: room.board,
      currentTurn: room.currentTurn,
      winner: room.winner,
      isFull: room.players.length === 2,
    };
  }

  static async deleteRoom(roomId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${roomId}`, { method: 'DELETE' });
      if (response.ok) {
        console.log(`🗑️ Salle supprimée: ${roomId}`);
      } else {
        console.error('❌ Erreur suppression salle');
      }
    } catch (error) {
      console.error('❌ Erreur delete:', error);
    }
  }

  private static calculateWinner(board: (string | null)[]): string | null {
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

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
}
