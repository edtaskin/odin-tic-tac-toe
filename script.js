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

    const board = (() => {
        const _board = [["", "", ""], ["", "", ""], ["", "", ""]];

        const getCell = function(row, col) {
            return _board[row][col];
        }
        const setCell = function(row, col, val) {
            console.log(_board);
            _board[row][col] = val;
        }
        const containsTriplet = function() {
            for (let i = 0; i < triplets.length; i++) {
                const [c1, c2, c3] = triplets[i];
                
                if (_board[c1] !== "" && _board[c1] === _board[c2] && _board[c1] === _board[c3]) {
                    playerWin = playerTurn;
                    return true;
                }   
            }
            return false;
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
        const getDiagonals = function() {
            return [
                [_board[0][0]]
            ];
        }    

        return {
            getCell,
            setCell,
            containsTriplet,
            getEmptyCells,
            getDiagonals,
        }
    })();

    const player = (() => {
        const mark = "X";
        const selectCell = function(row, col) {
            board.setCell(row, col, mark);
            //if (checkGameOver()) endGame(); // TODO Check here or in frontend?
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
            console.log(emptyCells);
            console.log(`emptyCells[${i}]: ${emptyCells[i]}`);
            return emptyCells[i];
        }
        const selectCell = function() {
            const [row, col] = _getRandomEmptyCell();
            console.log(row, col);

            board.setCell(row, col, mark);
            //if (checkGameOver()) endGame(); // TODO Check here or in frontend?
            playerTurn = !playerTurn;
            return [row, col];
        }
        return {
            getMark,
            selectCell,
        }
    })();

    function checkGameOver() {
        return board.containsTriplet();
    }

    function endGame() {

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
    
    return {
        getPlayer,
        getCPU,
        isPlayerTurn,
        checkGameOver,
        endGame,
    }
})();


const grid = document.querySelector(".game-grid-container");
const playerContainer = document.querySelector(".player-container");
const cpuContainer = document.querySelector(".cpu-container");
const GRID_SIZE = 3;
const IMAGE_WIDTH = 150;
const MARKER_WIDTH = 100;

playerContainer.innerHTML = `<img src="img/man-raising-hand.png" width=${IMAGE_WIDTH}>`;
cpuContainer.innerHTML = `<img src="img/robot_face.png" width=${IMAGE_WIDTH}>`;

for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add(`row${i}`);
        cell.classList.add(`col${j}`);

        cell.addEventListener("click", playerChoice)

        grid.appendChild(cell);
    }
}


function playerChoice(e) {
    console.log(`Clicked! isPlayerTurn: ${game.isPlayerTurn()}`);
    if (!game.isPlayerTurn()) return;
    changePlayerImage(playerContainer, "man.png");

    const row = e.target.id / GRID_SIZE;
    const col = e.target.id % GRID_SIZE;
    game.getPlayer().selectCell(row, col);
    placeMarker(e.target, "x");

    setTimeout(() => {
        // TODO CPU turn
        changePlayerImage("man-raising-hand.png");
        cpuChoice();
    }, 2000);
}

function cpuChoice() {
    const cpu = game.getCPU();
    const [row, col] = cpu.selectCell();
    const cell = grid.children[row * GRID_SIZE + col];
    placeMarker(cell, "o");
}


const placeImage = function(element, imgName, imgWidth=IMAGE_WIDTH, imgClass) {
    element.innerHTML = `<img src=${"img/" + imgName} ${imgClass ?  `class=${imgClass}`: ""} width=${imgWidth}>`
}

function placeMarker(cell, marker) {
    placeImage(cell, marker === "x" ? "x.png" : "o.png", MARKER_WIDTH, "place-marker-animation");
}

function changePlayerImage(imgName) {
    placeImage(playerContainer, imgName, IMAGE_WIDTH);
}
