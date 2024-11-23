import Cell from "./Cell.js";

class GUI {
    constructor() {
        this.ws = null;
        this.player = null;
        this.closeCodes = { ENDGAME: { code: 4000, description: "End of game." }, ADVERSARY_QUIT: { code: 4001, description: "The opponent quit the game" } };
        this.imageSet = new Array(30).fill(0).map((_, i) => `&#${i + 128000};`);
        this.defaultImage = "&#128529;";
    }
    coordinates(cell) {
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    setMessage(msg) {
        let message = document.getElementById("message");
        message.innerHTML = msg;
    }
    animation(div, img) {
        div.dataset.animation = "flip-in";
        div.onanimationend = () => {
            div.dataset.animation = "flip-out";
            div.innerHTML = img;
        };
    }
    getTableCell(cell) {
        let table = document.querySelector("table#board tbody");
        return table.rows[cell.x].cells[cell.y];
    }
    habilitar(tipo) {
        let cells = document.querySelectorAll("table#board tbody td");
        cells.forEach(elem => elem.onclick = tipo ? this.play.bind(this) : null);
    }
    buscar(div1, div2) {
        this.animation(div1, this.defaultImage);
        this.animation(div2, this.defaultImage);
        this.habilitar(true);
    }
    mostrar(data) {
        let ret = data.result;
        if (!ret) {
            return;
        }
        if (ret.card2 === undefined) {
            this.animation(this.getTableCell(ret.card1.cell).firstChild, this.imageSet[ret.card1.value]);
        } else {
            this.animation(this.getTableCell(ret.card2.cell).firstChild, this.imageSet[ret.card2.value]);
            let td1 = this.getTableCell(ret.card1.cell);
            let td2 = this.getTableCell(ret.card2.cell);
            if (ret.show) {
                td1.firstChild.className = "close";
                td2.firstChild.className = "close";
            }
            if (data.game.winner === "NONE") {
                this.habilitar(false);
                setTimeout(this.buscar.bind(this, td1.firstChild, td2.firstChild), 2000);
            }
        }
    }
    updateScores(data) {
        let [score1, score2] = data.game.scores;
        let myScore = document.querySelector("#myScore");
        let opScore = document.querySelector("#opScore");
        if (this.player === "PLAYER1") {
            myScore.textContent = score1;
            opScore.textContent = score2;
        } else {
            opScore.textContent = score1;
            myScore.textContent = score2;
        }
    }
    readData(evt) {
        let data = JSON.parse(evt.data);
        switch (data.type) {
            case "OPEN":
                /* Informando cor da peça do usuário atual */
                this.player = data.turn;
                this.setMessage("Waiting for opponent.");
                this.clearBoard();
                break;
            case "MESSAGE":
                /* Recebendo o tabuleiro modificado */
                if (data.result) {
                    this.mostrar(data);
                } else {
                    this.printBoard(data.game);
                }
                this.updateScores(data);
                this.setMessage(data.game.turn === this.player ? "Your turn." : "Opponent's turn.");
                break;
            case "ENDGAME":
                /* Fim do jogo */
                this.mostrar(data);
                this.updateScores(data);
                this.ws.close(this.closeCodes.ENDGAME.code, this.closeCodes.ENDGAME.description);
                this.endGame(data.result ? data.game.winner : this.player);
                break;
        }
    }
    endGame(type) {
        this.unsetEvents();
        this.ws = null;
        this.setButtonText(true);
        this.setMessage(`Game Over! ${(type === "DRAW") ? "Draw!" : (type === this.player ? "You win!" : "You lose!")}`);
    }
    setButtonText(on) {
        let button = document.querySelector("input[type='button']");
        button.value = on ? "Start" : "Quit";
    }
    clearBoard() {
        let table = document.querySelectorAll("table#board");
        table.innerHTML = "";
    }
    unsetEvents() {
        let innerUnset = id => {
            let cells = document.querySelectorAll(id);
            cells.forEach(td => td.onclick = undefined);
        };
        innerUnset("table#board td");
    }
    play(evt) {
        let begin = this.coordinates(evt.currentTarget);
        this.ws.send(JSON.stringify(begin));
    }
    printBoard(game) {
        let matrix = game.board;
        let tbody = document.querySelector("table#board tbody");
        tbody.innerHTML = "";
        for (let i = 0; i < matrix.length; i++) {
            let tr = document.createElement("tr");
            for (let j = 0; j < matrix[i].length; j++) {
                let td = document.createElement("td");
                let div = document.createElement("div");
                div.innerHTML = this.defaultImage;
                td.appendChild(div);
                td.onclick = this.play.bind(this);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }
    startGame() {
        if (this.ws) {
            this.ws.close(this.closeCodes.ADVERSARY_QUIT.code, this.closeCodes.ADVERSARY_QUIT.description);
            this.endGame();
        } else {
            this.ws = new WebSocket("ws://" + document.location.host + document.location.pathname + "memory");
            this.ws.onmessage = this.readData.bind(this);
            this.setButtonText(false);
        }
    }
    init() {
        let button = document.querySelector("input[type='button']");
        button.onclick = this.startGame.bind(this);
        this.setButtonText(true);
    }
}
let gui = new GUI();
gui.init();