import React from 'react';
import './TicTacToeBoard.css';

interface TicTacToeBoardProps {
    boardState: string;
    currentPlayerSymbol: 'X' | 'O';
    onCellClick: (index: number) => void;
}

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
    boardState,
    currentPlayerSymbol,
    onCellClick,
}) => {
    const handleClick = (index: number) => {
        if (boardState[index] === '-') {
            onCellClick(index);
        }
    };

    return (
        <div className="tic-tac-toe-board">
            {[...Array(9)].map((_, index) => (
                <button
                    key={index}
                    className="tic-tac-toe-cell"
                    onClick={() => handleClick(index)}
                >
                    {boardState[index] !== '-' ? boardState[index] : ''}
                </button>
            ))}
        </div>

    );
};

export default TicTacToeBoard;
