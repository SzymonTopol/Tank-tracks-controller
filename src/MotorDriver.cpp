#include "MotorDriver.h"

MotorDriver::MotorDriver(uint8_t pinEna, uint8_t pinIn1, uint8_t pinIn2,
                         uint8_t pinEnb, uint8_t pinIn3, uint8_t pinIn4,
                         uint8_t channelEna, uint8_t channelEnb, uint8_t pwmFrequency, uint8_t pwmResolution)
    : pinEna(pinEna), pinIn1(pinIn1), pinIn2(pinIn2),
      pinEnb(pinEnb), pinIn3(pinIn3), pinIn4(pinIn4),
      channelEna(channelEna), channelEnb(channelEnb),
      pwmFrequency(pwmFrequency), pwmResolution(pwmResolution)
{
}

void MotorDriver::begin()
{
    pinMode(pinEna, OUTPUT);
    pinMode(pinIn1, OUTPUT);
    pinMode(pinIn2, OUTPUT);

    pinMode(pinEnb, OUTPUT);
    pinMode(pinIn3, OUTPUT);
    pinMode(pinIn4, OUTPUT);

    ledcSetup(channelEna, pwmFrequency, pwmResolution);
    ledcSetup(channelEnb, pwmFrequency, pwmResolution);

    ledcAttachPin(pinEna, channelEna);
    ledcAttachPin(pinEnb, channelEnb);
}

void MotorDriver::setSpeeds(int16_t leftSpeed, int16_t rightSpeed)
{
    if (leftSpeed == 0)
    {
        digitalWrite(pinIn3, LOW);
        digitalWrite(pinIn4, LOW);
    }
    else if (leftSpeed > 0)
    {
        digitalWrite(pinIn3, LOW);
        digitalWrite(pinIn4, HIGH);
    }
    else
    {
        digitalWrite(pinIn3, HIGH);
        digitalWrite(pinIn4, LOW);
    }
    ledcWrite(channelEnb, abs(leftSpeed));

    if (rightSpeed == 0)
    {
        digitalWrite(pinIn1, LOW);
        digitalWrite(pinIn2, LOW);
    }
    else if (rightSpeed > 0)
    {
        digitalWrite(pinIn1, LOW);
        digitalWrite(pinIn2, HIGH);
    }
    else
    {
        digitalWrite(pinIn1, HIGH);
        digitalWrite(pinIn2, LOW);
    }
    ledcWrite(channelEna, abs(rightSpeed));
}

void MotorDriver::halt()
{
    digitalWrite(pinIn1, HIGH);
    digitalWrite(pinIn2, HIGH);
    digitalWrite(pinIn3, HIGH);
    digitalWrite(pinIn4, HIGH);

    ledcWrite(channelEna, 0);
    ledcWrite(channelEnb, 0);
}