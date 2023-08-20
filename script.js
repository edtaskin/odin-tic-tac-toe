// Backend
const game = (() => {
    let _playerTurn = true;
    const winningTriplets = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ]
    
    const TIE = "tie";
    const P_WIN = "win";
    const P_LOSE = "lose";

    const board = (() => {
        const _board = [["", "", ""], ["", "", ""], ["", "", ""]];
        let _full = false;
        let _triplet = null;

        const getCell = function(row, col) {
            return _board[row][col];
        }
        const getCellByIndex = function(index) {
            const [row, col] = getRowColFromIndex(index);
            return getCell(row, col);
        }
        const setCell = function(row, col, val) {
            _board[row][col] = val;
        }
        const containsTriplet = function() {
            if (_triplet) return _triplet;
            for (let i = 0; i < winningTriplets.length; i++) {
                const [c1, c2, c3] = winningTriplets[i];
                
                if (getCellByIndex(c1) !== "" && 
                    getCellByIndex(c1) === getCellByIndex(c2) &&
                    getCellByIndex(c2) === getCellByIndex(c3)) {
                    _triplet = winningTriplets[i];
                    return _triplet;
                }   
            }
            return null;
        }
        const getEmptyCells = function() {
            const emptyCells = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    if (_board[i][j] === "")
                        emptyCells.push([i, j]);
                }
            }
            return emptyCells;
        }
        const isFull = function() {
            if (_full) return _full;
            _full = getEmptyCells().length === 0;
            return _full;
        }    

        return {
            getCell,
            getCellByIndex,
            setCell,
            containsTriplet,
            getEmptyCells,
            isFull,
        }
    })();

    const player = (() => {
        const mark = "X";
        const selectCell = function(row, col) {
            board.setCell(row, col, mark);
            _playerTurn = !_playerTurn;
        }
        const getMark = function() {
            return mark;
        }
        return {
            getMark,
            selectCell,
        }
    })();

    const cpu = (() => {
        const mark = "O";
        const getMark = player.getMark;
        const _getRandomEmptyCell = function() {
            const emptyCells = board.getEmptyCells();
            const i = Math.trunc(Math.random() * emptyCells.length);
            return emptyCells[i];
        }
        const selectCell = function() {
            const [row, col] = _getRandomEmptyCell();
            board.setCell(row, col, mark);
            _playerTurn = !_playerTurn;
            return [row, col];
        }
        return {
            getMark,
            selectCell,
        }
    })();

    function checkGameOver() {
        return board.isFull() || board.containsTriplet();
    }

    function endGame() {
        if (board.isFull()) return TIE;
        const triplet = board.containsTriplet();
        if (board.getCellByIndex(triplet[0]) === player.getMark()) return P_WIN;
        else return P_LOSE;
    }

    const getPlayer = function() {
        return player;
    }

    const getCPU = function() {
        return cpu;
    }

    const isPlayerTurn = function()  {
        return _playerTurn;
    }

    // Helper functions
    const getRowColFromIndex = function(index) {
        const row = Math.trunc(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        return [row, col];
    }
    
    const getIndexFromRowCol = function(row, col) {
        return row * GRID_SIZE + col;
    }
    
    
    return {
        TIE,
        P_WIN,
        P_LOSE,
        getPlayer,
        getCPU,
        isPlayerTurn,
        checkGameOver,
        endGame,
        getRowColFromIndex,
        getIndexFromRowCol,
    }
})();

// Frontend
const GRID_SIZE = 3;
const IMAGE_WIDTH = 150;
const MARKER_WIDTH = 100;

const grid = document.querySelector(".game-grid-container");
const playerContainer = document.querySelector(".player-container");
const cpuContainer = document.querySelector(".cpu-container");
const winMsg = document.querySelector(".game-over-msg#win");
const lossMsg = document.querySelector(".game-over-msg#lose");
const tieMsg = document.querySelector(".game-over-msg#tie");
const isPlayerTurnContainer = document.querySelector(".left-container .is-current-player");
const isCPUTurnContainer = document.querySelector(".right-container .is-current-player");

let gameOver = false;
let isPlayerTurn = true;

placeImage(playerContainer, "man-raising-hand.png");
placeImage(cpuContainer, "robot.png");
placeImage(isPlayerTurnContainer, "point_up.png", IMAGE_WIDTH / 2); // Player starts first
placeImage(isCPUTurnContainer, "point_up.png", IMAGE_WIDTH / 2, "invisible");

for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add(`row${i}`);
        cell.classList.add(`col${j}`);
        cell.id = `${i * GRID_SIZE + j}`;

        cell.addEventListener("click", e =>  {
            console.log(`isPlayerTurn: ${isPlayerTurn}`);
            if (!isPlayerTurn || gameOver) return;
            toggleCurrentPlayerUI();
            playerTurn(e).then(() => checkGameOver());
            cpuTurn().then(() => checkGameOver());
        });
        grid.appendChild(cell);
    }
}


function playerTurn(e) {
    const [row, col] = game.getRowColFromIndex(e.target.id);
    game.getPlayer().selectCell(row, col);
    isPlayerTurn = !isPlayerTurn;
    return placeMarker(e.target, "x");
}

function cpuTurn() {
    changePlayerImage("man-raising-hand.png");
    const cpu = game.getCPU();
    const [row, col] = cpu.selectCell();
    const cell = grid.children[game.getIndexFromRowCol(row, col)];
    return new Promise(() => {
        setTimeout(() => {
            placeMarker(cell, cpu.getMark());
            isPlayerTurn = !isPlayerTurn;
        }, 500);
    });
}


function checkGameOver() {
    if (!game.checkGameOver()) return;
    const result = game.endGame();
    if (result === game.TIE) {
        tieMsg.classList.remove("hidden");
    }
    else if (result === game.P_WIN) {
        changePlayerImage("man-gesturing-ok.png").then(() => winMsg.classList.remove("hidden"));
    }
    else {
        changePlayerImage("man-facepalming.png").then(() => lossMsg.classList.remove("hidden"));
    } 
    isPlayerTurnContainer.firstChild.classList.add("invisible");
    isCPUTurnContainer.firstChild.classList.add("invisible");
    gameOver = true;
}

// Helper functions
function placeImage(element, imgName, imgWidth=IMAGE_WIDTH, imgClass) {
    return new Promise(resolve => {
        element.innerHTML = "";
        const imgElement = document.createElement("img");
        imgElement.src = "img/" + imgName;
        imgElement.width = imgWidth;
        if (imgClass) imgElement.classList.add(imgClass);

        element.appendChild(imgElement);
        imgElement.onload = () => resolve();
    });
}

function placeMarker(cell, marker) {
    return placeImage(cell, marker === "x" ? "x.png" : "o.png", MARKER_WIDTH, "place-marker-animation");
}

function changePlayerImage(imgName) {
    return placeImage(playerContainer, imgName, IMAGE_WIDTH);
}

function toggleCurrentPlayerUI() {
    isPlayerTurnContainer.firstChild.classList.toggle("invisible");
    isCPUTurnContainer.firstChild.classList.toggle("invisible");
}
