package com.github.szymontopol.rctank.backend.controller;

import com.github.szymontopol.rctank.backend.network.TankInput;
import com.github.szymontopol.rctank.backend.service.Esp32UdpService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class TankWebSocketHandler extends TextWebSocketHandler {

    private final Esp32UdpService esp32UdpService;
    private final ObjectMapper objectMapper;

    CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<WebSocketSession>();

    public TankWebSocketHandler(Esp32UdpService esp32UdpService, ObjectMapper objectMapper) {
        this.esp32UdpService = esp32UdpService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void handleTextMessage(org.springframework.web.socket.WebSocketSession session, org.springframework.web.socket.TextMessage message) throws Exception {
        TankInput tankInput = objectMapper.readValue(message.getPayload(), TankInput.class);
        esp32UdpService.sendMoveCommand(tankInput.left(), tankInput.right());
    }

    @Override
    public void afterConnectionEstablished(org.springframework.web.socket.WebSocketSession session) throws Exception {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(org.springframework.web.socket.WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    @Scheduled(fixedRate = 50)
    public void broadcastTelemetry(){
        if(sessions.isEmpty()) return;

        var telemetry = esp32UdpService.getTelemetryData();
        if(telemetry != null) {
            try {
                String jsonPayload = objectMapper.writeValueAsString(telemetry);
                org.springframework.web.socket.TextMessage message = new org.springframework.web.socket.TextMessage(jsonPayload);
                for(WebSocketSession session : sessions) {
                    try{
                        session.sendMessage(message);
                    }catch(Exception e) {
                        sessions.remove(session);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
