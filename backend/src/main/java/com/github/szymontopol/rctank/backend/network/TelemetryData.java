package com.github.szymontopol.rctank.backend.network;

public record TelemetryData(
   byte packetId,
   short expectedLeft,
   short expectedRight,
   short currentLeft,
   short currentRight,
   double leftP,
   double leftI,
   double leftD,
   double rightP,
   double rightI,
   double rightD,
   float batteryPercentage
) {}
