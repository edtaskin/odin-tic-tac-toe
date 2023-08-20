// Backend
const game = (() => {
    let playerTurn = true;
    let playerWin = null; 
    const triplets = [
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
            console.log(_board);
            _board[row][col] = val;
        }
        const containsTriplet = function() {
            if (_triplet) return _triplet;
            for (let i = 0; i < triplets.length; i++) {
                const [c1, c2, c3] = triplets[i];
                
                if (getCellByIndex(c1) !== "" && 
                    getCellByIndex(c1) === getCellByIndex(c2) &&
                    getCellByIndex(c2) === getCellByIndex(c3)) {
                    console.log(`Here: c1,c2,c3=${c1}, ${c2}, ${c3}`);
                    playerWin = playerTurn;
                    _triplet = triplets[i];
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
            playerTurn = !playerTurn;
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
            playerTurn = !playerTurn;
            return [row, col];
        }
        return {
            getMark,
            selectCell,
        }
    })();

    function checkGameOver() {
        console.log(`isFull: ${board.isFull()}`);
        console.log(`containsTriplet: ${board.containsTriplet()}`);
        return board.isFull() || board.containsTriplet();
    }

    function endGame() {
        if (board.isFull()) return TIE;
        const triplet = board.containsTriplet();
        console.log(board.getCellByIndex(triplet[0]));
        console.log(player.getMark());
        console.log(board.getCellByIndex(triplet[0]) === player.getMark());
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
        return playerTurn;
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

placeImage(playerContainer, "man-raising-hand.png");
placeImage(cpuContainer, "robot.png");

for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add(`row${i}`);
        cell.classList.add(`col${j}`);
        cell.id = `${i * GRID_SIZE + j}`;

        cell.addEventListener("click", e =>  {
            playerTurn(e);
            if (checkGameOver()) return;
            cpuTurn();
            if (checkGameOver()) return;
        });

        grid.appendChild(cell);
    }
}


function playerTurn(e) {
    console.log(e);
    if (!game.isPlayerTurn()) return;
    changePlayerImage("man.png");

    const [row, col] = game.getRowColFromIndex(e.target.id);
    game.getPlayer().selectCell(row, col);
    placeMarker(e.target, "x");
}

function cpuTurn() {
    changePlayerImage("man-raising-hand.png");
    const cpu = game.getCPU();
    const [row, col] = cpu.selectCell();
    const cell = grid.children[game.getIndexFromRowCol(row, col)];
    setTimeout(() => {
        placeMarker(cell, cpu.getMark());
    }, 2000);
}


function checkGameOver() {
    if (!game.checkGameOver()) return false;
    console.log(game.TIE, game.P_WIN, game.P_LOSE);
    const result = game.endGame();
    console.log(`Result: ${result}`);
    if (result === game.TIE)
        tieMsg.classList.remove("hidden");
    else if (result === game.P_WIN)
        winMsg.classList.remove("hidden");
    else 
        lossMsg.classList.remove("hidden");
    return true;
}

// Helper functions
function placeImage(element, imgName, imgWidth=IMAGE_WIDTH, imgClass) {
    element.innerHTML = `<img src=${"img/" + imgName} ${imgClass ?  `class=${imgClass}`: ""} width=${imgWidth}>`
}

function placeMarker(cell, marker) {
    placeImage(cell, marker === "x" ? "x.png" : "o.png", MARKER_WIDTH, "place-marker-animation");
}

function changePlayerImage(imgName) {
    placeImage(playerContainer, imgName, IMAGE_WIDTH);
}
