// @ts-check

export default class Cell {
    /**
     * Create a cell representing a position in the board.
     * @param {number} row - The x value.
     * @param {number} col - The y value.
     */
    constructor(row, col) {
        this.x = row;
        this.y = col;
    }
    /**
     * Compare two cells.
     * @param {Cell} cell - The cell value.
     */
    equals(cell) {
        return (cell.x === this.x && cell.y === this.y);
    }
}
