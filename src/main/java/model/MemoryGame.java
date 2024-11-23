package model;

import java.util.Arrays;
import java.util.Random;
import java.util.stream.IntStream;

public class MemoryGame {
    private int rows;
    private int cols;
    private Data[][] board;
    private Data firstCell;
    private Player turn;
    private int score1;
    private int score2;

    public MemoryGame() {
        this.rows = 0;
        this.cols = 0;
        this.board = null;
        this.firstCell = null;
        this.turn = Player.PLAYER1;
        this.score1 = 0;
        this.score2 = 0;
    }

    public Player getTurn() {
        return turn;
    }

    public int[] getScores() {
        return new int[] { this.score1, this.score2 };
    }

    public Data[][] getBoard() {
        var clone = new Data[rows][cols];
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                switch (this.board[i][j].getShow()) {
                    case State.HIDDEN:
                        clone[i][j] = new Data(-1, State.HIDDEN, new Cell(i, j));
                        break;
                    case State.SHOW:
                        clone[i][j] = new Data(board[i][j].getValue(), State.SHOW, new Cell(i, j));
                        break;
                    case State.INVISIBLE:
                        clone[i][j] = new Data(-1, State.INVISIBLE, new Cell(i, j));
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
        var cell = this.computeMatrixDimensions(n * 2);
        this.rows = cell.x();
        this.cols = cell.y();
        this.board = new Data[this.rows][this.cols];
        var array = IntStream.rangeClosed(1, n).toArray();
        var set = IntStream.concat(Arrays.stream(array), Arrays.stream(array)).toArray();
        shuffleArray(set);
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                this.board[i][j] = new Data(set[cols * i + j], State.HIDDEN, new Cell(i, j));
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

    public Winner getWinner() {
        if (this.board != null && Arrays.stream(this.board).flatMap(o -> Arrays.stream(o))
                .allMatch(v -> v.getShow() == State.INVISIBLE)) {
            return this.score1 > this.score2 ? Winner.PLAYER1
                    : this.score1 < this.score2 ? Winner.PLAYER2 : Winner.DRAW;
        }
        return Winner.NONE;
    }

    public Result play(Player player, Cell coords) {
        if (player != this.turn) {
            throw new IllegalArgumentException("It is not your turn.");
        }
        Data cell = this.board[coords.x()][coords.y()];
        if (cell.getShow() == State.INVISIBLE) {
            throw new IllegalArgumentException("This card was already discovered.");
        }
        if (cell.getShow() == State.SHOW) {
            throw new IllegalArgumentException("This card is already open.");
        }
        cell.setShow(State.SHOW);
        if (this.firstCell == null) {
            this.firstCell = cell;
            return new Result(cell, null, false);
        } else {
            if (this.firstCell.getValue() == cell.getValue()) {
                if (this.turn == Player.PLAYER1) {
                    this.score1++;
                } else {
                    this.score2++;
                }
                cell.setShow(State.INVISIBLE);
                this.firstCell.setShow(State.INVISIBLE);
            } else {
                cell.setShow(State.HIDDEN);
                this.firstCell.setShow(State.HIDDEN);
                this.turn = this.turn == Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
            }
            var c1 = this.firstCell;
            var c2 = cell;
            this.firstCell = null;
            return new Result(c1, c2, cell.getShow() == State.INVISIBLE);
        }
    }
}
