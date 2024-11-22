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
                this.printBoard(data.board);
                this.setMessage(data.turn === this.player ? "Your turn." : "Opponent's turn.");
                break;
            case "ENDGAME":
                /* Fim do jogo */
                this.printBoard(data.board);
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
        innerClean("table#myBoard td");
        innerClean("table#opBoard td");
    }
    unsetEvents() {
        let innerUnset = id => {
            let cells = document.querySelectorAll(id);
            cells.forEach(td => td.onclick = undefined);
        };
        innerUnset("table#myBoard td");
        innerUnset("table#opBoard td");
    }
    play(evt) {
        let begin = this.coordinates(evt.currentTarget);
        this.ws.send(JSON.stringify(begin));
    }
    printBoard(matrix) {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        for (let i = 0; i < matrix.length; i++) {
            let tr = document.createElement("tr");
            for (let j = 0; j < matrix[i].length; j++) {
                let td = document.createElement("td");
                td.innerHTML = this.defaultImage;
                td.className = "";
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