
const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");
const modeSelection = document.getElementById("modeSelection");
const gameArea = document.getElementById("gameArea");
const modeLabel = document.getElementById("modeLabel");

const aiModeBtn = document.getElementById("aiModeBtn");
const twoPlayerModeBtn = document.getElementById("twoPlayerModeBtn");
const restartBtn = document.getElementById("restartBtn");
const changeModeBtn = document.getElementById("changeModeBtn");

const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");
const playerOLabel = document.getElementById("playerOLabel");

let currentPlayer = "X";
let gameActive = true;
let gameMode = "twoPlayer";

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

// Choose Player vs AI
aiModeBtn.addEventListener("click", () => {
    startGame("ai");
});

// Choose two players
twoPlayerModeBtn.addEventListener("click", () => {
    startGame("twoPlayer");
});

function startGame(mode) {
    gameMode = mode;

    modeSelection.hidden = true;
    gameArea.hidden = false;

    if (gameMode === "ai") {
        modeLabel.textContent = "🤖 Player vs AI";
        playerOLabel.textContent = "AI (O)";
    } else {
        modeLabel.textContent = "👥 Two Players";
        playerOLabel.textContent = "Player O";
    }

    restartGame();
}

// Handle cell clicks
cells.forEach((cell) => {
    cell.addEventListener("click", () => {
        // Ignore clicks if the game is over
        if (!gameActive) return;

        // The human plays X in AI mode
        if (gameMode === "ai" && currentPlayer === "O") {
            return;
        }

        const index = Number(cell.dataset.index);

        if (board[index] !== "") return;

        makeMove(index, currentPlayer);

        if (finishTurn()) return;

        if (gameMode === "ai") {
            // Give the computer its turn
            currentPlayer = "O";
            statusText.textContent = "AI is thinking...";

            setTimeout(computerMove, 300);
        } else {
            // Switch between two human players
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

// Find a winning combination for either player
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

// Computer's turn
function computerMove() {
    if (!gameActive || gameMode !== "ai") return;

    const bestMove = findBestMove();

    if (bestMove !== -1) {
        makeMove(bestMove, "O");
    }

    if (finishTurn()) return;

    currentPlayer = "X";
    statusText.textContent = "Your turn (X)";
}

// Find the best move using Minimax
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O";

            const score = minimax(board, 0, false);

            board[i] = "";

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

// AI searches possible future moves
function minimax(currentBoard, depth, isMaximizing) {
    const winner = checkWinner(currentBoard);

    if (winner) {
        const [a] = winner;

        if (currentBoard[a] === "O") return 10 - depth;
        if (currentBoard[a] === "X") return depth - 10;
    }

    if (currentBoard.every((cell) => cell !== "")) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === "") {
                currentBoard[i] = "O";

                const score = minimax(
                    currentBoard,
                    depth + 1,
                    false
                );

                currentBoard[i] = "";
                bestScore = Math.max(bestScore, score);
            }
        }

        return bestScore;
    } else {
        let bestScore = Infinity;

        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === "") {
                currentBoard[i] = "X";

                const score = minimax(
                    currentBoard,
                    depth + 1,
                    true
                );

                currentBoard[i] = "";
                bestScore = Math.min(bestScore, score);
            }
        }

        return bestScore;
    }
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
        cell.disabled = false;
        cell.classList.remove("x", "o", "winner");
    });
}

// Return to game mode selection
changeModeBtn.addEventListener("click", () => {
    gameActive = false;

    gameArea.hidden = true;
    modeSelection.hidden = false;
});

// Restart button
restartBtn.addEventListener("click", restartGame);