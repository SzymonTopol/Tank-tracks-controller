package com.github.szymontopol.rctank.backend.network;

public record PidConfig(
        double k,
        double T_i,
        double T_d
) {}
