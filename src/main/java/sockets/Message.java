package sockets;

import model.MemoryGame;
import model.Player;
import model.Result;

public record Message(ConnectionType type, MemoryGame game, Player turn, Result result) {

}