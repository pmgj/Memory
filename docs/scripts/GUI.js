// @ts-check
import End from "./End.js";
import Cell from "./Cell.js";
import MemoryGame from "./MemoryGame.js";
import shuffleArray from "./Util.js";

class GUI {
    /** 
    * Memory board
    * @type { MemoryGame }
    */
    game;
    /** 
    * The first card opened by the user
    * @type { HTMLTableCellElement? }
    */
    card1;
    /** 
    * The second card opened by the user
    * @type { HTMLTableCellElement? }
    */
    card2;
    /** 
    * The image representing the default image
    * @type { string }
    */
    defaultImage;
    constructor() {
        this.game = new MemoryGame();
        this.card1 = null;
        this.card2 = null;
        this.imageSet = new Array(30).fill(0).map((_, i) => `&#${i + 128000};`);
        this.defaultImage = "&#128529;";
    }
    /** 
    * Enable or disable interaction with the board
    * @param { boolean } tipo
    */
    habilitar(tipo) {
        let cells = document.querySelectorAll("td");
        cells.forEach(elem => elem.onclick = tipo ? this.mostrar.bind(this) : null);
    }
    buscar() {
        if (!this.card1 || !this.card2) {
            throw new Error();
        }
        if (!(this.card1.firstChild instanceof HTMLDivElement) || !(this.card2.firstChild instanceof HTMLDivElement)) {
            throw new Error();
        }
        let td1
        this.animation(this.card1.firstChild, this.defaultImage);
        this.animation(this.card2.firstChild, this.defaultImage);
        this.card1 = this.card2 = null;
        this.habilitar(true);
    }
    /** 
    * Return the coordinates (Cell) of a TD element
    * @param { HTMLTableCellElement } cell
    */
    coordinates(cell) {
        if (!cell.parentNode) {
            throw new Error();
        }
        if (!(cell.parentNode instanceof HTMLTableRowElement)) {
            throw new Error();
        }
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    /** 
    * Animate a card
    * @param { HTMLDivElement } cell
    * @param { string } img
    */
    animation(cell, img) {
        cell.dataset.animation = "flip-in";
        cell.onanimationend = () => {
            cell.dataset.animation = "flip-out";
            cell.innerHTML = img;
        };
    }
    /** 
    * Function executed when a card is clicked
    * @param { PointerEvent } evt
    */
    mostrar(evt) {
        let td = evt.currentTarget;
        if (!(td instanceof HTMLTableCellElement)) {
            throw new Error();
        }
        let cell = this.coordinates(td);
        let ret = this.game.play(cell);
        if (this.card1 === td || (ret.card1 === null && ret.card2 === null)) {
            return;
        }
        if (!(td.firstChild instanceof HTMLDivElement)) {
            throw new Error();
        }
        if (this.card1 === null) {
            this.card1 = td;
            this.animation(td.firstChild, this.imageSet[ret.card1.value]);
        } else {
            this.card2 = td;
            if (!ret.card2) {
                throw new Error();
            }
            this.animation(td.firstChild, this.imageSet[ret.card2.value]);
            let plays = document.getElementById("plays");
            if (plays) plays.textContent = `${ret.plays}`;
            if (ret.show) {
                if (!(this.card1.firstChild instanceof HTMLDivElement) || !(this.card2.firstChild instanceof HTMLDivElement)) {
                    throw new Error();
                }
                this.card1.firstChild.className = "close";
                this.card2.firstChild.className = "close";
            }
            if (ret.end === End.NO) {
                this.habilitar(false);
                setTimeout(this.buscar.bind(this), 2000);
            } else {
                let msg = document.getElementById("message");
                if (msg) msg.textContent = "Game over! You win!";
            }
        }
    }
    init() {
        let start = document.querySelector("#start");
        if (start) start.addEventListener("click", this.start.bind(this));
        this.start();
    }
    start(evt) {
        evt?.preventDefault();
        shuffleArray(this.imageSet);
        this.card1 = null;
        this.card2 = null;
        let plays = document.getElementById("plays");
        if (plays) plays.textContent = "0";
        let diff = document.getElementById("diff");
        if (!(diff instanceof HTMLSelectElement)) {
            throw new Error();
        }
        let n = (diff) ? parseInt(diff.value) : 0;
        let board = this.game.init(n);
        let table = document.querySelector("tbody");
        if (table) table.innerHTML = "";
        for (let i = 0; i < board.length; i++) {
            let tr = table?.insertRow(i);
            for (let j = 0; j < board[i].length; j++) {
                let cell = tr?.insertCell(j);
                let div = document.createElement("div");
                div.innerHTML = this.defaultImage;
                cell?.appendChild(div);
                if (cell) cell.onclick = this.mostrar.bind(this);
            }
        }
        if (diff) diff.onchange = this.start.bind(this);
        let msg = document.getElementById("message");
        if (msg) msg.textContent = "";
    }
}
let gui = new GUI();
gui.init();
