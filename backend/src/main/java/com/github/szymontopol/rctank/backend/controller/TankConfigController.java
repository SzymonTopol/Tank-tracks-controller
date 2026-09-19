package com.github.szymontopol.rctank.backend.controller;

import com.github.szymontopol.rctank.backend.network.TankState;
import com.github.szymontopol.rctank.backend.service.Esp32HttpService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tank")
public class TankConfigController {

    private final Esp32HttpService esp32HttpService;

    public TankConfigController(Esp32HttpService esp32HttpService) {
        this.esp32HttpService = esp32HttpService;
    }

    @PostMapping("/halt")
    public void haltTank(){
        esp32HttpService.halt();
    }

    @GetMapping("/state")
    public TankState getTankState(){
        return esp32HttpService.getTankState();
    }

    @PostMapping("/pid")
    public void setPidConfig(@RequestBody TankState pidConfig){
        esp32HttpService.setPidParams(pidConfig);
    }

}
