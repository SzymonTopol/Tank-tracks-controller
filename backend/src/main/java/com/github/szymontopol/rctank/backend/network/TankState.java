package com.github.szymontopol.rctank.backend.network;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TankState(
        double k,
        @JsonProperty("T_i") double T_i,
        @JsonProperty("T_d") double T_d,
        int clamp,
        @JsonProperty("isHalt") boolean isHalt
) {}
