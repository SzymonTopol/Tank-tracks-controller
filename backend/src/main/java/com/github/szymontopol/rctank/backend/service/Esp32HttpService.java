package com.github.szymontopol.rctank.backend.service;

import com.github.szymontopol.rctank.backend.network.PidConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class Esp32HttpService {
    private static final Logger LOGGER = LoggerFactory.getLogger(Esp32HttpService.class);

    private final RestClient restClient;
    private static final String ESP32_BASE_URL = "http://192.168.4.1";

    public Esp32HttpService() {
        this.restClient = RestClient.builder().baseUrl(ESP32_BASE_URL).build();
    }

    public void halt(){
        try{
            restClient.get().uri("/halt").retrieve().toBodilessEntity();
        }catch(Exception e){
            LOGGER.error("halt failed",e);
        }

    }

    public PidConfig getPidParams() {
        try{
            return restClient.get().uri("/PIDParamsGet").retrieve().body(PidConfig.class);
        }catch(Exception e){
            LOGGER.error("getPidParams failed",e);
        }
        return null;
    }

    public void setPidParams(PidConfig pidConfig) {
        try{
            restClient.get().uri(uriBuilder -> uriBuilder.path("/PIDParamsChange").queryParam("k", pidConfig.k()).queryParam("T_i", pidConfig.T_i()).queryParam("T_d", pidConfig.T_d()).build()).retrieve().toBodilessEntity();
        }catch(Exception e){
            LOGGER.error("setPidParams failed",e);
        }
    }
}
