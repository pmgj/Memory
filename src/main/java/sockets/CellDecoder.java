package sockets;

import jakarta.json.bind.JsonbBuilder;
import jakarta.websocket.DecodeException;
import jakarta.websocket.Decoder;
import jakarta.websocket.EndpointConfig;
import model.Cell;

public class CellDecoder implements Decoder.Text<Cell> {
    @Override
    public void init(final EndpointConfig config) {
    }

    @Override
    public void destroy() {
    }

    @Override
    public Cell decode(final String textMessage) throws DecodeException {
        return JsonbBuilder.create().fromJson(textMessage, Cell.class);
    }

    @Override
    public boolean willDecode(final String s) {
        return true;
    }
}