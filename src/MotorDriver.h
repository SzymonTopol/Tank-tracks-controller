#pragma once
#include <Arduino.h>

class MotorDriver
{
private:
    uint8_t pinEna, pinIn1, pinIn2; // right
    uint8_t pinEnb, pinIn3, pinIn4; // left
    uint8_t channelEna, channelEnb;
    uint8_t pwmFrequency, pwmResolution;

public:
    MotorDriver(uint8_t pinEna, uint8_t pinIn1, uint8_t pinIn2,
                uint8_t pinEnb, uint8_t pinIn3, uint8_t pinIn4,
                uint8_t channelEna, uint8_t channelEnb, uint8_t pwmFrequency, uint8_t pwmResolution);

    void begin();
    void setSpeeds(int16_t leftSpeed, int16_t rightSpeed);
    void halt();
};