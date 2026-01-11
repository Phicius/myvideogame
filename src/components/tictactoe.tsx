import React, { FunctionComponent, useState, useEffect } from 'react';
import GameCanvas from './game-canvas';
import GameRoomService from '../services/game-room-service';

type Cell = 'X' | 'O' | null;

type Props = {
  gameId?: string;
};

const TicTacToe: FunctionComponent<Props> = ({ gameId }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => 
    Math.random().toString(36).substring(2, 9)
  );
  const [playerName, setPlayerName] = useState<string>('');
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<string>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId && isWaiting && !gameStarted) {
      const interval = setInterval(async () => {
        const state = await GameRoomService.getRoomState(roomId);
        if (state && state.isFull) {
          setGameStarted(true);
          setPlayers(state.players);
          clearInterval(interval);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [roomId, isWaiting, gameStarted]);

  const createGame = async () => {
    const name = playerName || `Joueur ${Math.floor(Math.random() * 1000)}`;
    console.log(`🎮 Création d'une salle...`);
    const newRoomId = await GameRoomService.createRoom();
    console.log(`📍 Nouvelle salle créée: ${newRoomId}`);
    
    // Attendre que la salle soit écrite en BDD
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const joinSuccess = await GameRoomService.joinRoom(newRoomId, playerId, name);
    console.log(`🔗 Rejoindre la salle: ${joinSuccess ? '✅' : '❌'}`);
    
    if (!joinSuccess) {
      setError('❌ Erreur lors de la création de la salle');
      return;
    }
    
    setRoomId(newRoomId);
    setPlayerName(name);
    setIsWaiting(true);
  };

  const joinGame = async (id: string) => {
    if (!id || id.trim() === '') {
      setError('Veuillez entrer un code de partie');
      return;
    }
    
    const name = playerName || `Joueur ${Math.floor(Math.random() * 1000)}`;
    const room = await GameRoomService.getRoom(id);
    
    if (!room) {
      setError('Partie non trouvée. Vérifiez le code.');
      return;
    }

    // Petite attente pour laisser la BDD se synchroniser
    await new Promise(resolve => setTimeout(resolve, 300));

    const joined = await GameRoomService.joinRoom(id, playerId, name);
    if (!joined) {
      setError('Impossible de rejoindre : la partie est pleine ou fermée');
      return;
    }

    setError(null);
    setRoomId(id);
    setPlayerName(name);
    setIsWaiting(true);
    const state = await GameRoomService.getRoomState(id);
    if (state) {
      setPlayers(state.players);
      setBoard(state.board);
    }
  };

  const updateGameState = async (id: string) => {
    const state = await GameRoomService.getRoomState(id);
    if (state) {
      setBoard(state.board);
      setCurrentTurn(state.currentTurn);
      setWinner(state.winner);
      setPlayers(state.players);
      if (state.isFull) setGameStarted(true);
    }
  };

  // Polling continuel pendant la partie pour synchroniser entre onglets
  useEffect(() => {
    if (!roomId || !gameStarted) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      await updateGameState(roomId);
    }, 500);

    // initial fetch
    updateGameState(roomId);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId, gameStarted]);

  const handleClick = async (index: number) => {
    if (!roomId || !gameStarted) return;

    if (await GameRoomService.makeMove(roomId, playerId, index)) {
      await updateGameState(roomId);
    }
  };

  const resetGame = async () => {
    if (roomId) {
      await GameRoomService.resetGame(roomId);
      await updateGameState(roomId);
    }
  };

  const renderSquare = (index: number) => {
    return (
      <button
        onClick={() => handleClick(index)}
        style={{
          width: '60px',
          height: '60px',
          fontSize: '24px',
          fontWeight: 'bold',
          border: '2px solid #333',
          cursor: board[index] || winner ? 'not-allowed' : 'pointer',
          backgroundColor: '#fff',
          margin: '5px',
        }}
      >
        {board[index]}
      </button>
    );
  };

  if (!roomId) {
    return (
      <GameCanvas>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>Morpion Multijoueur</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Votre nom (optionnel)"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setError(null);
              }}
              style={{
                padding: '10px',
                fontSize: '16px',
                marginRight: '10px',
                width: '200px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={createGame}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              ➕ Créer une partie
            </button>

            <button
              onClick={() => {
                const id = prompt('Entrez le code de la partie:');
                if (id) {
                  setError(null);
                  joinGame(id);
                }
              }}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              🔗 Rejoindre une partie
            </button>
          </div>
        </div>
      </GameCanvas>
    );
  }

  if (isWaiting && !gameStarted) {
    return (
      <GameCanvas>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>Salle d'attente</h3>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            Code : <strong style={{fontSize: '24px', color: '#2196F3'}}>{roomId}</strong>
          </p>
          <p>⏳ En attente d'un autre joueur...</p>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
            Partagez ce code avec votre ami
          </p>
          <button
            onClick={() => {
              if (roomId) updateGameState(roomId);
            }}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            🔄 Vérifier
          </button>
        </div>
      </GameCanvas>
    );
  }

  return (
    <GameCanvas>
      <div style={{ textAlign: 'center' }}>
        <h3>Morpion Multijoueur</h3>
        
        <div style={{ marginBottom: '15px', fontSize: '14px' }}>
          <p>Joueurs: {players.join(' vs ')}</p>
          <p>Partie: {roomId}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {winner === 'draw' ? (
            <h4 style={{ color: '#FF9800' }}>Égalité !</h4>
          ) : winner ? (
            <h4 style={{ color: '#4CAF50' }}>🎉 Le joueur {winner} a gagné !</h4>
          ) : (
            <h4>Tour du joueur : <strong>{currentTurn}</strong></h4>
          )}
        </div>

        <div style={{ display: 'inline-block', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 60px)', gap: '5px' }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderSquare(index))}
          </div>
        </div>

        <div>
          <button
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Nouvelle partie
          </button>
        </div>
      </div>
    </GameCanvas>
  );
};

export default TicTacToe;
