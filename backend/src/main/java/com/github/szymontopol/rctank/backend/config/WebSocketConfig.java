package com.github.szymontopol.rctank.backend.config;

import com.github.szymontopol.rctank.backend.controller.TankWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final TankWebSocketHandler tankWebSocketHandler;

    public WebSocketConfig(TankWebSocketHandler tankWebSocketHandler) {
        this.tankWebSocketHandler = tankWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(tankWebSocketHandler, "/ws/tank").setAllowedOrigins("*");
    }
}
