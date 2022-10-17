import State from "./State.js";
import End from "./End.js";
import shuffleArray from "./Util.js";

export default class MemoryGame {
    constructor() {
        this.rows = 0;
        this.cols = 0;
        this.board = null;
        this.numOfPlays = 0;
        this.firstCell = null;    
    }
    getBoard() {
        let clone = JSON.parse(JSON.stringify(this.board));
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                switch (clone[i][j].show) {
                    case State.HIDDEN:
                        clone[i][j] = State.HIDDEN;
                        break;
                    case State.SHOW:
                        clone[i][j] = clone[i][j].value;
                        break;
                    case State.INVISIBLE:
                        clone[i][j] = State.INVISIBLE;
                        break;
                }
            }
        }
        return clone;
    }
    init(n) {
        this.numOfPlays = 0;
        let { rows, cols } = this.computeMatrixDimensions(n * 2);
        this.rows = rows;
        this.cols = cols;
        this.board = Array(rows).fill().map(() => Array(cols).fill());
        let array = Array.from(Array(n).keys());
        let set = array.concat(array);
        shuffleArray(set);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.board[i][j] = { value: set[cols * i + j], show: State.HIDDEN };
            }
        }
        return this.getBoard();
    }
    play({ x, y }) {
        let cell = this.board[x][y];
        if (cell.show === State.HIDDEN) {
            cell.show = State.SHOW;
            if (!this.firstCell) {
                this.firstCell = cell;
                return { end: End.NO, plays: this.numOfPlays, card1: cell, card2: null, show: false };
            } else {
                this.numOfPlays++;
                if (this.firstCell.value === cell.value) {
                    cell.show = State.INVISIBLE;
                    this.firstCell.show = State.INVISIBLE;
                } else {
                    cell.show = State.HIDDEN;
                    this.firstCell.show = State.HIDDEN;
                }
                let c1 = this.firstCell, c2 = cell;
                this.firstCell = null;
                return { end: this.endOfGame(), plays: this.numOfPlays, card1: c1, card2: c2, show: c1.show === State.INVISIBLE };
            }
        }
        return { end: End.NO, plays: this.numOfPlays, card1: null, card2: null, show: false };
    }
    endOfGame() {
        return this.board.flat().every(v => v.show === State.INVISIBLE) ? End.YES : End.NO;
    }
    computeMatrixDimensions(size) {
        let row = Math.floor(Math.sqrt(size));
        let col = Math.floor(size / row);
        while (row * col !== size) {
            col = Math.floor(size / ++row);
        }
        return { rows: Math.min(row, col), cols: Math.max(row, col) };
    }
}