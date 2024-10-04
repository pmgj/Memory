package sockets;

import model.Data;
import model.Player;
import model.Winner;

public record Message(ConnectionType type, Player turn, Data[][] board, Winner winner) {

}