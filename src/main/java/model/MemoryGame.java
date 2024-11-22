package model;

import java.util.Arrays;
import java.util.Random;
import java.util.stream.IntStream;

public class MemoryGame {
    private int rows;
    private int cols;
    private Data[][] board;
    private Cell firstCell;
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

    public Data[][] getBoard() {
        var clone = new Data[rows][cols];
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                switch (this.board[i][j].getShow()) {
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

    public Winner getWinner() {
        if (Arrays.stream(this.board).flatMap(o -> Arrays.stream(o)).allMatch(v -> v.getShow() == State.INVISIBLE)) {
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
            this.firstCell = coords;
            return new Result(coords, null, false);
        } else {
            Data temp = this.board[this.firstCell.x()][this.firstCell.y()];
            if (temp.getValue() == cell.getValue()) {
                if (this.turn == Player.PLAYER1) {
                    this.score1++;
                } else {
                    this.score2++;
                }
                cell.setShow(State.INVISIBLE);
                temp.setShow(State.INVISIBLE);
            } else {
                cell.setShow(State.HIDDEN);
                temp.setShow(State.HIDDEN);
            }
            var c1 = this.firstCell;
            var c2 = coords;
            this.firstCell = null;
            this.turn = this.turn == Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
            return new Result(c1, c2, cell.getShow() == State.INVISIBLE);
        }
    }
}
