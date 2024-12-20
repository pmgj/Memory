package sockets;

import java.io.IOException;

import jakarta.websocket.CloseReason;
import jakarta.websocket.EncodeException;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import model.Cell;
import model.MemoryGame;
import model.Player;
import model.Result;
import model.Winner;

@ServerEndpoint(value = "/memory", encoders = MessageEncoder.class, decoders = CellDecoder.class)
public class Endpoint {

    private static Session s1;
    private static Session s2;
    private static MemoryGame game;

    @OnOpen
    public void onOpen(Session session) throws IOException, EncodeException {
        if (s1 == null) {
            s1 = session;
            game = new MemoryGame();
            s1.getBasicRemote().sendObject(new Message(ConnectionType.OPEN, game, Player.PLAYER1, null));
        } else if (s2 == null) {
            s2 = session;
            game.init(10);
            s2.getBasicRemote().sendObject(new Message(ConnectionType.OPEN, game, Player.PLAYER2, null));
            sendMessage(new Message(ConnectionType.MESSAGE, game, null, null));
        } else {
            session.close();
        }
    }

    @OnMessage
    public void onMessage(Session session, Cell beginCell) throws IOException, EncodeException {
        try {
            Result ret = game.play(session == s1 ? Player.PLAYER1 : Player.PLAYER2, beginCell);
            if (game.getWinner() == Winner.NONE) {
                sendMessage(new Message(ConnectionType.MESSAGE, game, null, ret));
            } else {
                sendMessage(new Message(ConnectionType.ENDGAME, game, null, ret));
            }
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }

    @OnClose
    public void onClose(Session session, CloseReason reason) throws IOException, EncodeException {
        switch (reason.getCloseCode().getCode()) {
            case 4000 -> {
                if (session == s1) {
                    s1 = null;
                } else {
                    s2 = null;
                }
            }
            case 1001, 4001 -> {
                if (session == s1) {
                    s2.getBasicRemote()
                            .sendObject(new Message(ConnectionType.ENDGAME, game, null, null));
                    s1 = null;
                } else {
                    s1.getBasicRemote()
                            .sendObject(new Message(ConnectionType.ENDGAME, game, null, null));
                    s2 = null;
                }
            }
            default -> {
                System.out.println(String.format("Close code %d incorrect", reason.getCloseCode().getCode()));
            }
        }
    }

    private void sendMessage(Message msg) throws EncodeException, IOException {
        s1.getBasicRemote().sendObject(msg);
        s2.getBasicRemote().sendObject(msg);
    }
}