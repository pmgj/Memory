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
    animation(cell, img) {
        cell.dataset.animation = "flip-in";
        cell.onanimationend = () => {
            cell.dataset.animation = "flip-out";
            cell.innerHTML = img;
        };
    }
    getTableCell(cell) {
        let table = document.querySelector("table#board tbody");
        return table.rows[cell.x].cells[cell.y];
    }
    mostrar(data) {
        let ret = data.result;
        let td = evt.currentTarget;
        if (ret.card1 === null) {
            this.animation(this.getTableCell(ret.card1), this.imageSet[ret.card1.value]);
        } else {
            this.card2 = td;
            this.animation(td.firstChild, this.imageSet[ret.card2.value]);
            let plays = document.getElementById("plays");
            if (plays) plays.textContent = `${ret.plays}`;
            if (ret.show) {
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
    readData(evt) {
        let data = JSON.parse(evt.data);
        console.log(data);
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
                    mostrar(data);
                } else {
                    this.printBoard(data.game);
                }
                this.setMessage(data.game.turn === this.player ? "Your turn." : "Opponent's turn.");
                break;
            case "ENDGAME":
                /* Fim do jogo */
                this.printBoard(data.game);
                this.ws.close(this.closeCodes.ENDGAME.code, this.closeCodes.ENDGAME.description);
                this.endGame(data.winner);
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
        let innerClean = id => {
            let cells = document.querySelectorAll(id);
            cells.forEach(td => {
                td.innerHTML = "";
                td.className = "";
                td.onclick = undefined;
            });
        };
        innerClean("table#board td");
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
                td.innerHTML = "";
                td.className = "";
                td.onclick = this.play.bind(this);
                tr.appendChild(td);
                switch (matrix[i][j].show) {
                    case "HIDDEN":
                        td.innerHTML = this.defaultImage;
                        break;
                    case "SHOW":
                        td.innerHTML = this.imageSet[matrix[i][j].value];
                        break;
                }
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