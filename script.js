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

    const boardController = (() => {
        const _board = [["", "", ""], ["", "", ""], ["", "", ""]];

        const getCell = function(row, col) {
            return _board[row][col];
        }
        const setCell = function(row, col, val) {
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
            for (let i = 0; i < triplets.length; i++) {
                for (let j = 0; j < triplets.length; j++) {
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
            boardController.setCell(row, col, mark);
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
        const getRandomEmptyCell = function() {

        }
        const selectCell = function() {
            const [row, col] = getRandomEmptyCell();
            player.selectCell(row, col);
        }
        return {
            getMark,
            selectCell,
        }
    })();

    function checkGameOver() {
        return boardController.containsTriplet();
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
const IMAGE_WIDTH = 250;

playerContainer.innerHTML = `<img src="img/man-raising-hand.png" width=${IMAGE_WIDTH}>`;
cpuContainer.innerHTML = `<img src="img/robot_face.png" width=${IMAGE_WIDTH}>`;

for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add(`row${i}`);
        cell.classList.add(`col${j}`);

        cell.addEventListener("click", placeMark)

        grid.appendChild(cell);
    }
}


function placeMark(e) {
    console.log(`Clicked! isPlayerTurn: ${game.isPlayerTurn()}`);
    if (!game.isPlayerTurn()) return;
    playerContainer.innerHTML = `<img src="img/man.png" width=${IMAGE_WIDTH}>`;
    const row = e.target.id / GRID_SIZE;
    const col = e.target.id % GRID_SIZE;
    game.getPlayer().selectCell(row, col);
    e.target.innerHTML = `<img src="img/x.png" width=100>`; // TODO Make dynamic. Can we load images before and then make it visible.
    setTimeout(() => {
        // TODO CPU turn
        if (!game.checkGameOver())
            playerContainer.innerHTML = `<img src="img/man-raising-hand.png" width=${IMAGE_WIDTH}>`;
    }, 2000);
}
