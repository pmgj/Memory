// @ts-check
import State from "./State.js";
import End from "./End.js";
import shuffleArray from "./Util.js";
import Cell from "./Cell.js";

export default class MemoryGame {
    /** 
    * Memory board
    * @type { {value: number, show: string}[][] }
    */
    #board;
    #rows;
    #cols;
    #numOfPlays;
    /** 
    * First card selected
    * @type { {value: number, show: string} }
    */
    #firstCell;
    constructor() {
        this.#rows = 0;
        this.#cols = 0;
        this.#numOfPlays = 0;
        this.#firstCell = { value: -1, show: State.INVISIBLE };
    }
    getBoard() {
        let clone = JSON.parse(JSON.stringify(this.#board));
        for (let i = 0; i < this.#rows; i++) {
            for (let j = 0; j < this.#cols; j++) {
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
    /**
     * Create a new board.
     * @param {number} n - The number of cards in the game.
     */
    init(n) {
        this.#numOfPlays = 0;
        let { rows, cols } = this.computeMatrixDimensions(n * 2);
        this.#rows = rows;
        this.#cols = cols;
        this.#board = Array(rows).fill(undefined).map(() => Array(cols).fill(undefined));
        let array = Array.from(Array(n).keys());
        let set = array.concat(array);
        shuffleArray(set);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.#board[i][j] = { value: set[cols * i + j], show: State.HIDDEN };
            }
        }
        return this.getBoard();
    }
    /**
     * Play a new card.
     * @param {Cell} cell - The card the player wants to open.
     */
    play({ x, y }) {
        let cell = this.#board[x][y];
        if (cell.show === State.HIDDEN) {
            cell.show = State.SHOW;
            if (this.#firstCell.value === -1) {
                this.#firstCell = cell;
                return { end: End.NO, plays: this.#numOfPlays, card1: cell, card2: null, show: false };
            } else {
                this.#numOfPlays++;
                if (this.#firstCell.value === cell.value) {
                    cell.show = State.INVISIBLE;
                    this.#firstCell.show = State.INVISIBLE;
                } else {
                    cell.show = State.HIDDEN;
                    this.#firstCell.show = State.HIDDEN;
                }
                let c1 = this.#firstCell, c2 = cell;
                this.#firstCell = { value: -1, show: State.INVISIBLE };
                return { end: this.endOfGame(), plays: this.#numOfPlays, card1: c1, card2: c2, show: c1.show === State.INVISIBLE };
            }
        }
        return { end: End.NO, plays: this.#numOfPlays, card1: null, card2: null, show: false };
    }
    endOfGame() {
        return this.#board.flat().every(v => v.show === State.INVISIBLE) ? End.YES : End.NO;
    }
    /**
     * Returns the dimensions of the board based on the number of cards.
     * @param {number} size - The number of cards in the game.
     */
    computeMatrixDimensions(size) {
        let row = Math.floor(Math.sqrt(size));
        let col = Math.floor(size / row);
        while (row * col !== size) {
            col = Math.floor(size / ++row);
        }
        return { rows: Math.min(row, col), cols: Math.max(row, col) };
    }
}