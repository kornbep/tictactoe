
const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");
const modeSelection = document.getElementById("modeSelection");
const difficultySelection = document.getElementById("difficultySelection");
const gameArea = document.getElementById("gameArea");
const modeLabel = document.getElementById("modeLabel");

const aiModeBtn = document.getElementById("aiModeBtn");
const twoPlayerModeBtn = document.getElementById("twoPlayerModeBtn");
const restartBtn = document.getElementById("restartBtn");
const changeModeBtn = document.getElementById("changeModeBtn");
const backBtn = document.getElementById("backBtn");

const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");
const playerOLabel = document.getElementById("playerOLabel");

let currentPlayer = "X";
let gameActive = true;
let gameMode = "twoPlayer";
let difficulty = "easy";

let board = ["", "", "", "", "", "", "", "", ""];

let scoreX = 0;
let scoreO = 0;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Show difficulty selection
aiModeBtn.addEventListener("click", () => {
    modeSelection.hidden = true;
    difficultySelection.hidden = false;
});

// Return to game mode selection
backBtn.addEventListener("click", () => {
    difficultySelection.hidden = true;
    modeSelection.hidden = false;
});

// Select AI difficulty
document.querySelectorAll("[data-difficulty]").forEach((button) => {
    button.addEventListener("click", () => {
        startGame("ai", button.dataset.difficulty);
    });
});

// Start two-player mode
twoPlayerModeBtn.addEventListener("click", () => {
    startGame("twoPlayer");
});

function startGame(mode, selectedDifficulty = "easy") {
    gameMode = mode;
    difficulty = selectedDifficulty;

    modeSelection.hidden = true;
    difficultySelection.hidden = true;
    gameArea.hidden = false;

    if (gameMode === "ai") {
        const names = {
            easy: "Easy",
            difficult: "Difficult",
            hard: "Hard"
        };

        modeLabel.textContent = `🤖 Player vs AI — ${names[difficulty]}`;
        playerOLabel.textContent = "AI (O)";
    } else {
        modeLabel.textContent = "👥 Two Players";
        playerOLabel.textContent = "Player O";
    }

    restartGame();
}

// Handle player clicks
cells.forEach((cell) => {
    cell.addEventListener("click", () => {
        if (!gameActive) return;

        // Prevent clicking during the AI's turn
        if (gameMode === "ai" && currentPlayer === "O") {
            return;
        }

        const index = Number(cell.dataset.index);

        if (board[index] !== "") return;

        makeMove(index, "X");

        if (finishTurn()) return;

        if (gameMode === "ai") {
            currentPlayer = "O";
            statusText.textContent = "AI is thinking...";

            setTimeout(computerMove, 300);
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            statusText.textContent = `Player ${currentPlayer}'s turn`;
        }
    });
});

// Place a mark on the board
function makeMove(index, player) {
    board[index] = player;

    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
}

// Check for a winner or draw
function finishTurn() {
    const winningCombo = checkWinner(board);

    if (winningCombo) {
        gameActive = false;

        winningCombo.forEach((index) => {
            cells[index].classList.add("winner");
        });

        if (currentPlayer === "X") {
            scoreX++;
            scoreXText.textContent = scoreX;

            statusText.textContent =
                gameMode === "ai"
                    ? "You win! 🎉"
                    : "Player X wins! 🎉";
        } else {
            scoreO++;
            scoreOText.textContent = scoreO;

            statusText.textContent =
                gameMode === "ai"
                    ? "AI wins! 🤖"
                    : "Player O wins! 🎉";
        }

        return true;
    }

    if (board.every((cell) => cell !== "")) {
        gameActive = false;
        statusText.textContent = "It's a draw! 🤝";
        return true;
    }

    return false;
}

// Detect winning combinations
function checkWinner(currentBoard) {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;

        if (
            currentBoard[a] !== "" &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[b] === currentBoard[c]
        ) {
            return combination;
        }
    }

    return null;
}

// Find empty cells
function getAvailableMoves(currentBoard) {
    return currentBoard
        .map((value, index) => value === "" ? index : -1)
        .filter((index) => index !== -1);
}

// Test whether a player can win in one move
function findWinningMove(player) {
    for (const index of getAvailableMoves(board)) {
        board[index] = player;

        const wins = checkWinner(board) !== null;

        board[index] = "";

        if (wins) return index;
    }

    return -1;
}

// EASY: Choose a random available cell
function getEasyMove() {
    const moves = getAvailableMoves(board);

    return moves[Math.floor(Math.random() * moves.length)];
}

// DIFFICULT: Win, block, take center/corners, or choose randomly
function getDifficultMove() {
    // Win immediately if possible
    const winningMove = findWinningMove("O");

    if (winningMove !== -1) {
        return winningMove;
    }

    // Block the player's immediate win
    const blockingMove = findWinningMove("X");

    if (blockingMove !== -1) {
        return blockingMove;
    }

    // Prefer the center
    if (board[4] === "") {
        return 4;
    }

    // Prefer an available corner
    const corners = [0, 2, 6, 8].filter(
        (index) => board[index] === ""
    );

    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Otherwise choose an available side
    return getEasyMove();
}

// HARD: Use Minimax to find an optimal move
function getHardMove() {
    let bestScore = -Infinity;
    let bestMoves = [];

    for (const index of getAvailableMoves(board)) {
        board[index] = "O";

        const score = minimax(board, 0, false);

        board[index] = "";

        if (score > bestScore) {
            bestScore = score;
            bestMoves = [index];
        } else if (score === bestScore) {
            bestMoves.push(index);
        }
    }

    // Randomly choose between equally good moves
    return bestMoves[
        Math.floor(Math.random() * bestMoves.length)
    ];
}

// Minimax algorithm
function minimax(currentBoard, depth, isMaximizing) {
    const winningCombo = checkWinner(currentBoard);

    if (winningCombo) {
        const winner = currentBoard[winningCombo[0]];

        if (winner === "O") return 10 - depth;
        if (winner === "X") return depth - 10;
    }

    if (currentBoard.every((cell) => cell !== "")) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (const index of getAvailableMoves(currentBoard)) {
            currentBoard[index] = "O";

            const score = minimax(currentBoard, depth + 1, false);

            currentBoard[index] = "";
            bestScore = Math.max(bestScore, score);
        }

        return bestScore;
    } else {
        let bestScore = Infinity;

        for (const index of getAvailableMoves(currentBoard)) {
            currentBoard[index] = "X";

            const score = minimax(currentBoard, depth + 1, true);

            currentBoard[index] = "";
            bestScore = Math.min(bestScore, score);
        }

        return bestScore;
    }
}

// Computer's turn
function computerMove() {
    if (!gameActive || gameMode !== "ai") return;

    let index;

    if (difficulty === "easy") {
        index = getEasyMove();
    } else if (difficulty === "difficult") {
        index = getDifficultMove();
    } else {
        index = getHardMove();
    }

    if (index === -1) return;

    makeMove(index, "O");

    if (finishTurn()) return;

    currentPlayer = "X";
    statusText.textContent = "Your turn (X)";
}

// Restart the current round
function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";
    gameActive = true;

    statusText.textContent =
        gameMode === "ai"
            ? "Your turn (X)"
            : "Player X's turn";

    cells.forEach((cell) => {
        cell.textContent = "";
        cell.classList.remove("x", "o", "winner");
    });
}

// Change game mode
changeModeBtn.addEventListener("click", () => {
    gameActive = false;

    gameArea.hidden = true;
    difficultySelection.hidden = true;
    modeSelection.hidden = false;
});

// Restart current round without resetting scores
restartBtn.addEventListener("click", restartGame);