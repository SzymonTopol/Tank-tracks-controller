package com.github.szymontopol.rctank.backend.network;

public record MoveCommand(
   byte packetId,
   short leftExpectedPower,
   short rightExpectedPower
) {}
