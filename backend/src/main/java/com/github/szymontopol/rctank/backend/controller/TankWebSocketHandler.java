package com.github.szymontopol.rctank.backend.controller;

import com.github.szymontopol.rctank.backend.network.TankInput;
import com.github.szymontopol.rctank.backend.service.Esp32UdpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class TankWebSocketHandler extends TextWebSocketHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(TankWebSocketHandler.class);

    private final Esp32UdpService esp32UdpService;
    private final ObjectMapper objectMapper;

    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    public TankWebSocketHandler(Esp32UdpService esp32UdpService, ObjectMapper objectMapper) {
        this.esp32UdpService = esp32UdpService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        TankInput tankInput = objectMapper.readValue(message.getPayload(), TankInput.class);
        esp32UdpService.sendMoveCommand(tankInput.left(), tankInput.right());

        LOGGER.trace("Received message: {}", message.getPayload());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        LOGGER.debug("WebSocket connection established: {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        LOGGER.debug("WebSocket connection closed: {}", session.getId());
    }

    @Scheduled(fixedRate = 50)
    public void broadcastTelemetry() {
        if(sessions.isEmpty()) return;

        var telemetry = esp32UdpService.getTelemetryData();
        if (telemetry != null) {
            try {
                String jsonPayload = objectMapper.writeValueAsString(telemetry);
                TextMessage message = new TextMessage(jsonPayload);

                for (WebSocketSession session : sessions) {
                    try {
                        session.sendMessage(message);
                    } catch (Exception e) {
                        LOGGER.warn("Failed to send telemetry to session {}, removing from active pool", session.getId(), e);
                        sessions.remove(session);
                    }
                }
            } catch (Exception e) {
                LOGGER.error("Error serializing or broadcasting telemetry data", e);
            }
        }
    }
}