import React, { useEffect, useState } from 'react';
import './MainForm.css';
import TicTacToeBoard from './TicTacToeBoard';

interface Player {
    playerId: string;
    nickname: string;
}

interface Game {
    gameId: string;
    boardState: string;
    gameStatus: string;
    player1Nickname: string;
    player2Nickname: string;
    winner: string;
}


const MainForm: React.FC = () => {
    const [nickname, setNickname] = useState('');
    const [player, setPlayer] = useState<Player | null>(null);
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [game, setGame] = useState<Game | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [loading, setLoading] = useState(false);

    const MainForm = async () => {
        try {
            const response = await fetch('http://localhost:5088/api/game/registerplayer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Nickname: nickname }),
            });

            if (response.ok) {
                const data: Player = await response.json();
                setPlayer(data);
                setError('');
                setIsRegistered(true);
            } else {
                setError('Что-то пошло не так, попробуйте ещё раз.');
            }
        } catch (err) {
            setError('Что-то пошло не так, попробуйте ещё раз.');
        }
    };

    const joinGame = async () => {
        setIsJoining(true);
        try {
            const response = await fetch('http://localhost:5088/api/game/joingame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playerId: player?.playerId }),
            });
            if (response.ok) {
                const data: Game = await response.json();
                setGame(data);
                setError('');
            } else {
                setError('Что-то пошло не так, попробуйте ещё раз.');
            }
        } catch (err) {
            setError('Что-то пошло не так, попробуйте ещё раз.');
        }
        setIsJoining(false);
    };

    const fetchGameState = async () => {
        setLoading(true);
        try {
            if (game && game.gameId) {
                const response = await fetch(`http://localhost:5088/api/game/${game.gameId}/state`);
                if (response.ok) {
                    const updatedGame = await response.json();
                    setGame(updatedGame);
                } else {
                    console.error('Ошибка при обновлении состояния игры');
                }
            }
        } catch (err) {
            console.error('Ошибка при обновлении состояния игры', err);
        }
        setLoading(false);
    };

    const handleCellClick = async (index: number) => {
        try {
            const response = await fetch('http://localhost:5088/api/game/makemove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: game!.gameId,
                    position: index,
                    playerId: player!.playerId,
                }),
            });
    
            if (response.ok) {
                const newBoardState = game!.boardState.split('');
                const currentPlayerSymbol = player!.nickname === game!.player1Nickname ? 'X' : 'O';
                newBoardState[index] = currentPlayerSymbol;
                setGame({
                    ...game!,
                    boardState: newBoardState.join(''),
                });
            } else {
                setError('Ошибка при обработке хода');
            }
        } catch (err) {
            setError('Ошибка при обработке хода');
        }
    };
    
    

    useEffect(() => {
        if (game && game.gameId) {
            const interval = setInterval(() => {
                fetchGameState();
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [game]);

    return (
        <div className="center">
            {player ? (
                <>
                    <p>
                        Ваш ник {player.nickname} - Ваш id {player.playerId}
                    </p>
                    {game?.gameStatus != null ? <p>id игры - {game?.gameId}</p> : null}
                    {game?.gameStatus === 'Waiting' ? (
                        <><p>Пожалуйста, подождите, пока ищется второй игрок. Игра начнётся автоматически</p></>
                    ) : game?.gameStatus === 'InProgress' ? (
                        <div>
                            <h2>Игровое поле</h2>
                            <p>
                                Вы играете за: <strong>{player.nickname === game.player1Nickname ? 'X' : 'O'}</strong>
                            </p>
                            <TicTacToeBoard
                                boardState={game.boardState}
                                currentPlayerSymbol={player.nickname === game.player1Nickname ? 'X' : 'O'}
                                onCellClick={handleCellClick}
                            />
                        </div>
                    ) : game?.gameStatus === 'Ended' ? (
                        <p>
                            Игра закончена - {game.winner === 'Draw' ? 'ничья' : game.winner === player.nickname ? 'вы победили' : 'вы проиграли'}
                        </p>
                    ) : isJoining ? (
                        <p>Подключение к игре...</p>
                    ) : (
                        <button onClick={joinGame}>Присоединиться к игре</button>
                    )}
                </>
            ) : (
                <>
                    <h1>Регистрация игрока</h1>
                    <div>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Введите никнейм"
                        />
                    </div>
                    <div>
                            <button onClick={MainForm}>Зарегистрироваться</button>
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </>
            )}
        </div>
    );
};

export default MainForm;