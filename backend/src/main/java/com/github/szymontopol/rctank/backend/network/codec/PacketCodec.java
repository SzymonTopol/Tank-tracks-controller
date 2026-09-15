package com.github.szymontopol.rctank.backend.network.codec;

import com.github.szymontopol.rctank.backend.network.MoveCommand;
import com.github.szymontopol.rctank.backend.network.TelemetryData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

//Coder for movement
//Decoder for telemetry
@Component
public class PacketCodec {

    private static final Logger LOGGER = LoggerFactory.getLogger(PacketCodec.class);

    //Command ID's
    public static final byte CMD_MOVE = 0x01;
    public static final byte CMD_TELEMETRY = 0x02;

    // 1 byte (ID) + 2 shorts
    public static final int EXPECTED_CMD_MOVE_SIZE =
            Byte.BYTES +
            (2 * Short.BYTES);
    // 1 byte (ID) + 4 shorts + 6 doubles + 1 float
    public static final int EXPECTED_TELEMETRY_SIZE =
            Byte.BYTES +
            (4 * Short.BYTES) +
            (6 * Double.BYTES) +
            Float.BYTES;

    public byte[] encodeMoveCommand(MoveCommand moveCommand) {

        if(moveCommand == null) {
            throw new IllegalArgumentException("MoveCommand cannot be null");

        }
        if(moveCommand.packetId() != CMD_MOVE) {
            throw new IllegalArgumentException("Invalid packet ID");
        }

        ByteBuffer buffer = ByteBuffer.allocate(EXPECTED_CMD_MOVE_SIZE);
        buffer.order(ByteOrder.LITTLE_ENDIAN);

        buffer.put(moveCommand.packetId());
        buffer.putShort(moveCommand.leftExpectedPower());
        buffer.putShort(moveCommand.rightExpectedPower());
        return buffer.array();
    }

    public TelemetryData decodeTelemetryData(byte[] payload) {
        LOGGER.debug("Decoding telemetry data");
        if(payload == null) {
            LOGGER.error("Invalid payload. Payload is null");
            return null;
        }

        if(payload.length != EXPECTED_TELEMETRY_SIZE) {
            LOGGER.error("Invalid payload length. Size = " + payload.length + " Expected: " + EXPECTED_TELEMETRY_SIZE);
            return null;
        }

        ByteBuffer buffer = ByteBuffer.wrap(payload);
        buffer.order(ByteOrder.LITTLE_ENDIAN);

        byte packetId = buffer.get();
        LOGGER.debug("Decoding telemetry data with packet ID: " + packetId);

        if(packetId!=CMD_TELEMETRY) {
            LOGGER.error("Invalid packet ID. Expected: " + CMD_TELEMETRY);
            return null;
        }

        TelemetryData data = new TelemetryData(
                packetId,
                buffer.getShort(),
                buffer.getShort(),
                buffer.getShort(),
                buffer.getShort(),
                buffer.getDouble(),
                buffer.getDouble(),
                buffer.getDouble(),
                buffer.getDouble(),
                buffer.getDouble(),
                buffer.getDouble(),
                buffer.getFloat()
        );

        return data;
    }
}
