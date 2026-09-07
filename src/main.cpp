#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <Preferences.h>

#include "Config.h"
#include "Protocol.h"
#include "MotorDriver.h"
#include "PID.h"

// Track power (-255 to 255) sent by controller
int16_t expectedLeftTrackPower = 0;
int16_t expectedRightTrackPower = 0;

int16_t currentLeftTrackPower = 0;
int16_t currentRightTrackPower = 0;

unsigned long interval = 50;
unsigned long refTime = 0;

unsigned long lastCommandTime = 0;
unsigned long lastCommandDeadline = 1000;

WebServer server(80);
WiFiUDP udp;

Preferences preferences;

MotorDriver chassis(ENA_PIN, IN1_PIN, IN2_PIN,
                    ENB_PIN, IN3_PIN, IN4_PIN,
                    ENA_CHANNEL, ENB_CHANNEL, FREQUENCY, RESOLUTION);

void setPIDParameters(double k, double T_i, double T_d);

String getPIDParameters();

void setExpectedTrackPower(int16_t leftTrackPower, int16_t rightTrackPower)
{
  expectedLeftTrackPower = constrain(leftTrackPower, -255, 255);
  expectedRightTrackPower = constrain(rightTrackPower, -255, 255);
}

void setupTankTelemetryPacket(TankTelemetry *packet);

PID *leftTrackController = new PID(0, 0, 0, 15, RESOLUTION);
PID *rightTrackController = new PID(0, 0, 0, 15, RESOLUTION);

void setup()
{
  chassis.begin();

  Serial.begin(115200);

  preferences.begin("pid_cfg", false);
  double saved_k = preferences.getDouble("k", 0.05);
  double saved_T_i = preferences.getDouble("T_i", 15);
  double saved_T_d = preferences.getDouble("T_d", 0);

  setPIDParameters(saved_k, saved_T_i, saved_T_d);

  WiFi.softAP(AP_SSID, AP_PASS);
  udp.begin(UDP_PORT);

  server.on("/halt", HTTP_GET, []()
            {
    HALT();
    server.send(200, "text/plain", "Tank Halted");
    lastCommandTime = millis(); });

  server.on("/PIDParamsChange", HTTP_GET, []()
            {
    if(server.hasArg("k") && server.hasArg("T_i") && server.hasArg("T_d")){
      double k = server.arg("k").toDouble();
      double T_i = server.arg("T_i").toDouble();
      double T_d = server.arg("T_d").toDouble();

      setPIDParameters(k,T_i,T_d);
      server.send(200, "text/plain", "PID parameters changed");
    }else{
      server.send(400, "text/plain", "Missing arguments");
    }
    lastCommandTime = millis(); });

  server.on("/PIDParamsGet", HTTP_GET, []()
            {
    String jsonString = getPIDParameters();
    server.send(200, "application/json", jsonString);
    lastCommandTime = millis(); });

  server.begin();

  HALT(); // safety precausion
}

void loop()
{
  int packetSize = udp.parsePacket();

  if (packetSize > 0)
  {
    uint8_t buffer[MAX_BUFFER_SIZE];
    int len = udp.read(buffer, sizeof(buffer));

    while (packetSize > 0)
    {
      len = udp.read(buffer, sizeof(buffer));
      packetSize = udp.parsePacket();
    }

    if (len > 0)
    {
      uint8_t packetId = buffer[0];
      switch (packetId)
      {
      case CMD_MOVE:
        if (len == sizeof(ControllerCommand))
        {

          ControllerCommand *cmd = (ControllerCommand *)buffer;

          setExpectedTrackPower(cmd->leftExpectedPower, cmd->rightExpectedPower);

          lastCommandTime = millis();
        }
        break;

      default:
        Serial.println("Unknown UDP packet received");
        break;
      }
    }
  }

  // API HTTP_GET calls
  server.handleClient();

  if (millis() - refTime >= interval)
  {
    refTime = millis();

    if (millis() - lastCommandTime > lastCommandDeadline)
      HALT();

    currentLeftTrackPower = constrain(leftTrackController->calculate_u(expectedLeftTrackPower - currentLeftTrackPower), -255, 255);
    currentRightTrackPower = constrain(rightTrackController->calculate_u(expectedRightTrackPower - currentRightTrackPower), -255, 255);

    chassis.setSpeeds(currentLeftTrackPower, currentRightTrackPower);

    TankTelemetry data;
    setupTankTelemetryPacket(&data);
    udp.beginPacket("192.168.4.255", UDP_PORT);
    udp.write((uint8_t *)&data, sizeof(data));
    udp.endPacket();
  }
}

void HALT()
{ // For Emergency stopping both tracks

  chassis.halt();

  expectedLeftTrackPower = 0;
  expectedRightTrackPower = 0;
  currentLeftTrackPower = 0;
  currentRightTrackPower = 0;

  leftTrackController->resetMemory();
  rightTrackController->resetMemory();
}

void setPIDParameters(double k, double T_i, double T_d)
{
  leftTrackController->setProportionalGain(k);
  leftTrackController->setIntegralTime(T_i);
  leftTrackController->setDerivitiveTime(T_d);

  rightTrackController->setProportionalGain(k);
  rightTrackController->setIntegralTime(T_i);
  rightTrackController->setDerivitiveTime(T_d);

  preferences.putDouble("k", k);
  preferences.putDouble("T_i", T_i);
  preferences.putDouble("T_d", T_d);
}

String getPIDParameters()
{
  JsonDocument doc;

  doc["left_track"]["k"] = leftTrackController->getProportionalGain();
  doc["left_track"]["ti"] = leftTrackController->getIntegralTime();
  doc["left_track"]["td"] = leftTrackController->getDerivitiveTime();

  doc["right_track"]["k"] = rightTrackController->getProportionalGain();
  doc["right_track"]["ti"] = rightTrackController->getIntegralTime();
  doc["right_track"]["td"] = rightTrackController->getDerivitiveTime();

  String parameters;
  serializeJson(doc, parameters);

  return parameters;
}

void setupTankTelemetryPacket(TankTelemetry *packet)
{
  packet->packetId = CMD_TELEMETRY;
  packet->expectedLeft = expectedLeftTrackPower;
  packet->expectedRight = expectedRightTrackPower;
  packet->currentLeft = currentLeftTrackPower;
  packet->currentRight = currentRightTrackPower;

  packet->leftP = leftTrackController->getLastP();
  packet->leftI = leftTrackController->getLastI();
  packet->leftD = leftTrackController->getLastD();
  packet->rightP = rightTrackController->getLastP();
  packet->rightI = rightTrackController->getLastI();
  packet->rightD = rightTrackController->getLastD();
}