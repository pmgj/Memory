package model;

public class Data {
    private int value;
    private State show;

    public Data(int value, State show) {
        this.value = value;
        this.show = show;
    }

    public State getShow() {
        return show;
    }

    public int getValue() {
        return value;
    }

    public void setShow(State show) {
        this.show = show;
    }

    public void setValue(int value) {
        this.value = value;
    }
}
