const board = document.querySelector('.board');
const gameOverLayer = document.querySelector('.game-over-layer');
const gameOverText = document.querySelector('.game-over-text')
const restartBtn = document.querySelector('.btn-restart');
const flagsNum = document.querySelector('.flags');
const btnSetting = document.querySelector('.btn-setting');
const cellArray = [];
const width = 10;
const bombNums = (width * width) / 5;

let isGameOver = false;
let flags = 0;

//To check if the current cell is in the left/right edge or not
const isLeftEdge = (i) => (i % width === 0);
const isRightEdge = (i) => (i % width === width - 1);

(function boardInitialize() {
    for (let i = 0; i < width * width; i++) {
        let cell = document.createElement('div');
        cell.setAttribute('id', i);

        //Left click to open the cell
        cell.addEventListener('click', () => {
            cellClick(cell);
        });

        //Right click to add flag
        cell.oncontextmenu = (e) => {
            e.preventDefault();
            addFlag(cell);
        }

        board.appendChild(cell);
        cellArray.push(cell);
    }

    addNumbersForCellNearBombs();
}())

//Add the number of total bombs near a cell
function addNumbersForCellNearBombs() {
    bombCreate();

    for (let i = 0; i < cellArray.length; i++) {
        let total = 0;

        if (cellArray[i].classList.contains('valid')) {
            if (i > 0 && !isLeftEdge(i) && cellArray[i - 1].classList.contains('bomb')) total++;
            if (i < 99 && !isRightEdge(i) && cellArray[i + 1].classList.contains('bomb')) total++;
            if (i > 9 && cellArray[i - width].classList.contains('bomb')) total++;
            if (i < 90 && cellArray[i + width].classList.contains('bomb')) total++;
            if (i < 90 && !isLeftEdge(i) && cellArray[i - 1 + width].classList.contains('bomb')) total++;
            if (i > 9 && !isRightEdge(i) && cellArray[i + 1 - width].classList.contains('bomb')) total++;
            if (i > 10 && !isLeftEdge(i) && cellArray[i - 1 - width].classList.contains('bomb')) total++;
            if (i < 89 && !isRightEdge(i) && cellArray[i + 1 + width].classList.contains('bomb')) total++;
            cellArray[i].setAttribute('data', total);
        }
    }
}

function bombCreate() {
    const bombsArray = Array(bombNums).fill('bomb');
    const emptyArray = Array(width * width - bombNums).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    cellArray.forEach((cell, index) => {
        cell.classList.add("cell", `${shuffledArray[index]}`);
    })
}

function addFlag(cell) {
    if (isGameOver) return;
    if (!cell.classList.contains('checked')) {
        if (!cell.classList.contains('flag') && (flags < bombNums)) {
            cell.classList.add('flag');
            cell.innerHTML = '🚩';
            flags++;
            if (checkWin()) {
                gameOver(!isGameOver)
            }
        } else if (cell.classList.contains('flag')) {
            cell.classList.remove('flag');
            cell.innerHTML = '';
            flags--;
        }

        flagsNum.innerHTML = bombNums - flags;
    }
}


function cellClick(cell) {
    if (cell.classList.contains('checked') || cell.classList.contains('flag')) return;
    else cell.classList.add('checked');

    let cellValue = cell.getAttribute('data');
    if (!(cell.classList.contains('bomb'))) {
        if (validCellsCheck()) {
            gameOver(!isGameOver);
        } else {
            if (cellValue != 0) {
                cell.innerHTML = cellValue;
            } else {
                //If a cell has no bombs around, call the cellClick function for all of its neighbors which is not yet opened and no flag
                checkNeighbors(cell);
            }
        }
    } else {
        gameOver(isGameOver);
    }
}

//Check all the neighbors of the current cell
function checkNeighbors(cell) {
    let id = cell.id;
    let neighborsArray = [];

    if (id > 0 && !isLeftEdge(id)) neighborsArray.push(document.getElementById(`${+id - 1}`));
    if (id < 99 && !isRightEdge(id)) neighborsArray.push(document.getElementById(`${+id + 1}`));
    if (id > 9) neighborsArray.push(document.getElementById(`${+id - width}`));
    if (id < 90) neighborsArray.push(document.getElementById(`${+id + width}`));
    if (id > 9 && !isRightEdge(id)) neighborsArray.push(document.getElementById(`${+id + 1 - width}`));
    if (id < 89 && !isRightEdge(id)) neighborsArray.push(document.getElementById(`${+id + 1 + width}`));
    if (id > 10 && !isLeftEdge(id)) neighborsArray.push(document.getElementById(`${+id - 1 - width}`));
    if (id < 90 && !isLeftEdge(id)) neighborsArray.push(document.getElementById(`${+id - 1 + width}`));

    neighborsArray.forEach(neighbor => {
        setTimeout(() => {
            cellClick(neighbor);
        }, 20);
    })
}

//Set the text based on win or loose, also reset the board
function gameOver(isGameOver) {
    gameOverLayer.classList.add('active');

    if (!isGameOver) {
        gameOverText.innerHTML = 'Game Over';
    } else gameOverText.innerHTML = 'Won';

    cellArray.forEach(cell => {
        if (cell.classList.contains('bomb')) {
            cell.innerHTML = '💣';
        }
    })

    restartBtn.addEventListener('click', () => {
        gameOverLayer.classList.remove('active');
        cellArray.forEach(cell => {
            cell.className = 'cell';
            cell.innerHTML = '';
        })

        addNumbersForCellNearBombs();
        isGameOver = false;
        flags = 0;
        flagsNum.innerHTML = bombNums - flags;
    })
}

function validCellsCheck() {
    let validCells = [...document.querySelectorAll('.valid')];
    return validCells.every(cell => cell.classList.contains('checked'))
}

function checkWin() {
    let bombCells = [...document.querySelectorAll('.bomb')];
    return (bombCells.every(cell => cell.classList.contains('flag')) && validCellsCheck())
}