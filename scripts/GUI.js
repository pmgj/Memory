import End from "./End.js";
import Cell from "./Cell.js";
import MemoryGame from "./MemoryGame.js";
import shuffleArray from "./Util.js";

class GUI {
    constructor() {
        this.game = new MemoryGame();
        this.card1 = null;
        this.card2 = null;
        this.imageSet = [
            "brasao-abc-1383080810897_80x80.png",
            "brasao-america-mg-1383080847296_80x80.png",
            "brasao-america-rn-1383080869267_80x80.png",
            "brasao-atletico-go-1383080920254_80x80.png",
            "brasao-atletico-mg-1383012954563_80x80.png",
            "brasao-atletico-pr-1383012934593_80x80.png",
            "brasao-avai-1383080947570_80x80.png",
            "brasao-bahia-1383012989687_80x80.png",
            "brasao-boa-1383081053755_80x80.png",
            "brasao-botafogo-1383012764678_80x80.png",
            "brasao-bragantino-1383081085382_80x80.png",
            "brasao-ceara-1383081156590_80x80.png",
            "brasao-chapecoense-1383081240819_80x80.png",
            "brasao-corinthians-1383013079679_80x80.png",
            "brasao-coritiba-1383013134670_80x80.png",
            "brasao-criciuma-1383013096968_80x80.png",
            "brasao-cruzeiro-1383012800767_80x80.png",
            "brasao-figueirense-1383081262573_80x80.png",
            "brasao-flamengo-1383013182930_80x80.png",
            "brasao-fluminense-1384196872174_80x80.png",
            "brasao-goias-1383012842853_80x80.png",
            "brasao-gremio-1383012821050_80x80.png",
            "brasao-icasa-1383081304822_80x80.png",
            "brasao-inter-1383012732937_80x80.png",
            "brasao-joinville-1383081323459_80x80.png",
            "brasao-luverdense-1385556774354_80x80.png",
            "brasao-nautico-1383013061647_80x80.png",
            "brasao-oeste-1383081343643_80x80.png",
            "brasao-palmeiras-1383081365846_80x80.png",
            "brasao-parana-1383081388556_80x80.png",
            "brasao-ponte-preta-1383013043294_80x80.png",
            "brasao-portuguesa-1383013161974_80x80.png",
            "brasao-sampaio-correa-1385557566647_80x80.png",
            "brasao-santa-cruz-1385557594638_80x80.png",
            "brasao-santos-1383012712997_80x80.png",
            "brasao-sao-paulo-1383012783800_80x80.png",
            "brasao-sport-1383081509432_80x80.png",
            "brasao-vasco-1383013201926_80x80.png",
            "brasao-vila-nova-go-1385557637575_80x80.png",
            "brasao-vitoria-1383012971846_80x80.png"
        ];    
    }
    habilitar(tipo) {
        let cells = document.querySelectorAll("td");
        cells.forEach(elem => elem.onclick = tipo ? this.mostrar.bind(this) : null);
    }
    buscar() {
        let cells = document.querySelectorAll("td");
        cells.forEach(elem => elem.style.backgroundImage = "");
        this.card1 = this.card2 = null;
        this.habilitar(true);
    }
    coordinates(cell) {
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    mostrar(evt) {
        let td = evt.currentTarget;
        let cell = this.coordinates(td);
        let ret = this.game.play(cell);
        if (this.card1 === td) {
            return;
        }
        if (this.card1 === null) {
            this.card1 = td;
            td.style.backgroundImage = `url(images/${this.imageSet[ret.card1.value]})`;
        } else {
            this.card2 = td;
            td.style.backgroundImage = `url(images/${this.imageSet[ret.card2.value]})`;
            document.getElementById("plays").textContent = ret.plays;
            if (this.card1.style.backgroundImage === this.card2.style.backgroundImage) {
                this.card1.className = "close";
                this.card2.className = "close";
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
    start() {
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
                cell.onclick = this.mostrar.bind(this);
            }
        }
        diff.onchange = this.init.bind(this);
        let msg = document.getElementById("message");
        msg.textContent = "";
    }
}
let gui = new GUI();
gui.init();
