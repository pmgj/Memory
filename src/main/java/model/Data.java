package model;

public class Data {
    private int value;
    private State show;
    private Cell cell;

    public Data(int value, State show, Cell cell) {
        this.value = value;
        this.show = show;
        this.cell = cell;
    }

    public State getShow() {
        return show;
    }

    public int getValue() {
        return value;
    }

    public Cell getCell() {
        return cell;
    }

    public void setShow(State show) {
        this.show = show;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public void setCell(Cell cell) {
        this.cell = cell;
    }
}
