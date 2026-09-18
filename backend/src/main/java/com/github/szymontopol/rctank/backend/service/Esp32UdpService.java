package com.github.szymontopol.rctank.backend.service;

import com.github.szymontopol.rctank.backend.network.MoveCommand;
import com.github.szymontopol.rctank.backend.network.TelemetryData;
import com.github.szymontopol.rctank.backend.network.codec.PacketCodec;
import org.springframework.stereotype.Service;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.concurrent.atomic.AtomicReference;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class Esp32UdpService {

    private static final Logger LOGGER = LoggerFactory.getLogger(Esp32UdpService.class.getName());

    private final PacketCodec packetCodec;
    private DatagramSocket socket;
    private InetAddress esp32Address;
    private final AtomicReference<TelemetryData> telemetryData = new AtomicReference<>();

    private static final int ESP32_PORT = 4210;
    private static final String ESP32_IP = "192.168.4.1";

    Esp32UdpService(PacketCodec packetCodec) {
        this.packetCodec = packetCodec;

        try{
            this.socket = new DatagramSocket(ESP32_PORT);
            this.esp32Address = InetAddress.getByName(ESP32_IP);
            LOGGER.info("UDP Socket initiated, targeting ESP32 at {}:{}", ESP32_IP, ESP32_PORT);
        } catch (Exception e) {
            LOGGER.error("Failed to initialize ESP32 UDP service", e);
            throw new IllegalStateException("Failed to initialize ESP32 UDP service", e);
        }
        startListening();
    }

    public void sendMoveCommand(short leftPower, short rightPower) {
        // from -255 to 255
        leftPower = (short) Math.max(-255, Math.min(255, leftPower));
        rightPower = (short) Math.max(-255, Math.min(255, rightPower));
        MoveCommand moveCommand = new MoveCommand(PacketCodec.CMD_MOVE, leftPower, rightPower);

        try {
            byte[] payload = packetCodec.encodeMoveCommand(moveCommand);
            DatagramPacket packet = new DatagramPacket(payload, payload.length, esp32Address, ESP32_PORT);
            socket.send(packet);
            System.out.println("Sending " + moveCommand.toString() + " to ESP32 at " + esp32Address.getHostAddress());
        } catch (Exception e) {
            LOGGER.error("Failed to send UDP packet", e);
        }
    }

    public TelemetryData getTelemetryData() {
        return telemetryData.get();
    }

    private void startListening() {
        Thread listeningThread = new Thread(() -> {
            byte[] buffer = new byte[PacketCodec.EXPECTED_TELEMETRY_SIZE];
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            while (true) {
                try {
                    socket.receive(packet);
                    telemetryData.set(packetCodec.decodeTelemetryData(packet.getData()));
                } catch (Exception e) {
                    LOGGER.error("Failed to receive UDP packet", e);
                }

            }
        });
        listeningThread.setDaemon(true);
        listeningThread.start();
    }
}
