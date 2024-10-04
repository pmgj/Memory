import End from "./End.js";
import Cell from "./Cell.js";
import MemoryGame from "./MemoryGame.js";
import shuffleArray from "./Util.js";

class GUI {
    constructor() {
        this.game = new MemoryGame();
        this.card1 = null;
        this.card2 = null;
        this.imageSet = new Array(30).fill(0).map((e, i) => `&#${i + 128000};`);
        this.defaultImage = "&#128529;";
    }
    habilitar(tipo) {
        let cells = document.querySelectorAll("td");
        cells.forEach(elem => elem.onclick = tipo ? this.mostrar.bind(this) : null);
    }
    buscar() {
        this.animation(this.card1.firstChild, this.defaultImage);
        this.animation(this.card2.firstChild, this.defaultImage);
        this.card1 = this.card2 = null;
        this.habilitar(true);
    }
    coordinates(cell) {
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    animation(cell, img) {
        cell.dataset.animation = "flip-in";
        cell.onanimationend = () => {
            cell.dataset.animation = "flip-out";
            cell.innerHTML = img;
        };
    }
    mostrar(evt) {
        let td = evt.currentTarget;
        let cell = this.coordinates(td);
        let ret = this.game.play(cell);
        if (this.card1 === td || (ret.card1 === null && ret.card2 === null)) {
            return;
        }
        if (this.card1 === null) {
            this.card1 = td;
            this.animation(td.firstChild, this.imageSet[ret.card1.value]);
        } else {
            this.card2 = td;
            this.animation(td.firstChild, this.imageSet[ret.card2.value]);
            let plays = document.getElementById("plays");
            plays.textContent = ret.plays;
            if (ret.show) {
                this.card1.firstChild.className = "close";
                this.card2.firstChild.className = "close";
            }
            if (ret.end === End.NO) {
                this.habilitar(false);
                setTimeout(this.buscar.bind(this), 2000);
            } else {
                let msg = document.getElementById("message");
                msg.textContent = "Game over! You win!";
            }
        }
    }
    init() {
        let start = document.querySelector("#start");
        start.onclick = this.start.bind(this);
        this.start();
    }
    start(evt) {
        evt?.preventDefault();
        shuffleArray(this.imageSet);
        this.card1 = null;
        this.card2 = null;
        document.getElementById("plays").textContent = 0;
        let diff = document.getElementById("diff");
        let n = parseInt(diff.value);
        let board = this.game.init(n);
        let table = document.querySelector("tbody");
        table.innerHTML = "";
        for (let i = 0; i < board.length; i++) {
            let tr = table.insertRow(i);
            for (let j = 0; j < board[i].length; j++) {
                let cell = tr.insertCell(j);
                let div = document.createElement("div");
                div.innerHTML = this.defaultImage;
                cell.appendChild(div);
                cell.onclick = this.mostrar.bind(this);
            }
        }
        diff.onchange = this.start.bind(this);
        let msg = document.getElementById("message");
        msg.textContent = "";
    }
}
let gui = new GUI();
gui.init();
