#pragma once

#define CMD_MOVE 0x01
#define CMD_TELEMETRY 0x02 // if need be for future expansion of new commands from controller (with UDP), this could be put as an enum in some file

struct __attribute__((packed)) ControllerCommand
{
    uint8_t packetId;
    int16_t leftExpectedPower;
    int16_t rightExpectedPower;
};

struct __attribute__((packed)) TankTelemetry
{ // for the purpose of controller graphs
    uint8_t packetId;
    int16_t expectedLeft;
    int16_t expectedRight;
    int16_t currentLeft;
    int16_t currentRight;
    double_t leftP;
    double_t leftI;
    double_t leftD;
    double_t rightP;
    double_t rightI;
    double_t rightD;
    float batteryPercentage
};