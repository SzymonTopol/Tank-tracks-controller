#include <Arduino.h>

#define IN1_PIN 27
#define IN2_PIN 26
#define IN3_PIN 25
#define IN4_PIN 33

void left_track_forward(bool is_forward);

void right_track_forward(bool is_forward);

void left_track_stop();
void right_track_stop();
void all_track_stop(){
  left_track_stop();
  right_track_stop();
}

int reference_time = 0;
int stage = 0;

void setup() {
  pinMode(IN1_PIN, OUTPUT);
  pinMode(IN2_PIN, OUTPUT);
  pinMode(IN3_PIN, OUTPUT);
  pinMode(IN4_PIN, OUTPUT);
}

void loop() {

  if (millis()-reference_time > 2000)
  {
    stage++;
    reference_time += 2000;
    if (stage > 5) stage = 0;
    

    switch (stage){
      case 0:
        right_track_forward(true);
        left_track_stop();
        break;
      case 1:
        right_track_stop();
        left_track_forward(true);
        break;
      case 2:
        all_track_stop();
        break;
      case 3:
        right_track_forward(true);
        left_track_forward(true);
        break;
      case 4:
        all_track_stop();
        break;
      case 5:
        right_track_forward(false);
        left_track_forward(false);
        
    }
  }
  
  //2 sekundy lewy

  //2 sekundy prawy
  
  //2 sekundy stopu

  //2 sekundy razem do przodu

  //2 sekundy stopu

  //2 sekundy razem do tyłu
}

void left_track_forward(bool is_forward){
  if(is_forward){
    digitalWrite(IN1_PIN, HIGH);
    digitalWrite(IN2_PIN, LOW);
  }else{
    digitalWrite(IN1_PIN, LOW);
    digitalWrite(IN2_PIN, HIGH);
  }
}

void right_track_forward(bool is_forward){
  if(is_forward){
    digitalWrite(IN4_PIN, HIGH);
    digitalWrite(IN3_PIN, LOW);
  }else{
    digitalWrite(IN4_PIN, LOW);
    digitalWrite(IN3_PIN, HIGH);
  }
}

void left_track_stop(){
  digitalWrite(IN1_PIN,LOW);
  digitalWrite(IN2_PIN,LOW);
}

void right_track_stop(){
  digitalWrite(IN4_PIN,LOW);
  digitalWrite(IN3_PIN,LOW);
}