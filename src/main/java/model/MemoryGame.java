package model;

import java.util.Arrays;
import java.util.Random;
import java.util.stream.IntStream;

public class MemoryGame {
    private int rows;
    private int cols;
    private Data[][] board;
    private int numOfPlays;
    private Data firstCell;

    public MemoryGame() {
        this.rows = 0;
        this.cols = 0;
        this.board = null;
        this.numOfPlays = 0;
        this.firstCell = null;
    }

    private Data[][] getBoard() {
        var clone = new Data[rows][cols];
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                switch (clone[i][j].getShow()) {
                    case State.HIDDEN:
                        clone[i][j] = new Data(-1, State.HIDDEN);
                        break;
                    case State.SHOW:
                        clone[i][j] = new Data(board[i][j].getValue(), State.SHOW);
                        break;
                    case State.INVISIBLE:
                        clone[i][j] = new Data(-1, State.INVISIBLE);
                        break;
                }
            }
        }
        return clone;
    }

    private Cell computeMatrixDimensions(int size) {
        var row = Math.floor(Math.sqrt(size));
        var col = Math.floor(size / row);
        while (row * col != size) {
            col = Math.floor(size / ++row);
        }
        return new Cell((int) Math.min(row, col), (int) Math.max(row, col));
    }

    public Data[][] init(int n) {
        this.numOfPlays = 0;
        var cell = this.computeMatrixDimensions(n * 2);
        this.rows = cell.x();
        this.cols = cell.y();
        this.board = new Data[this.rows][this.cols];
        var array = IntStream.rangeClosed(1, n).toArray();
        var set = IntStream.concat(Arrays.stream(array), Arrays.stream(array)).toArray();
        shuffleArray(set);
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                this.board[i][j] = new Data(set[cols * i + j], State.HIDDEN);
            }
        }
        return this.getBoard();
    }

    private void shuffleArray(int[] array) {
        Random rand = new Random();
        for (int i = 0; i < array.length; i++) {
            int randomIndexToSwap = rand.nextInt(array.length);
            int temp = array[randomIndexToSwap];
            array[randomIndexToSwap] = array[i];
            array[i] = temp;
        }
    }

    private End endOfGame() {
        return Arrays.stream(this.board).flatMap(o -> Arrays.stream(o)).allMatch(v -> v.getShow() == State.INVISIBLE)
                ? End.YES
                : End.NO;
    }

    public Result play(Cell coords) {
        Data cell = this.board[coords.x()][coords.y()];
        if (cell.getShow() == State.HIDDEN) {
            cell.setShow(State.SHOW);
            if (this.firstCell != null) {
                this.firstCell = cell;
                return new Result(End.NO, this.numOfPlays, cell, null, false);
            } else {
                this.numOfPlays++;
                if (this.firstCell.getValue() == cell.getValue()) {
                    cell.setShow(State.INVISIBLE);
                    this.firstCell.setShow(State.INVISIBLE);
                } else {
                    cell.setShow(State.HIDDEN);
                    this.firstCell.setShow(State.HIDDEN);
                }
                var c1 = this.firstCell;
                var c2 = cell;
                this.firstCell = null;
                return new Result(this.endOfGame(), this.numOfPlays, c1, c2, c1.getShow() == State.INVISIBLE);
            }
        }
        return new Result(End.NO, this.numOfPlays, null, null, false);
    }
}
