
#include <Wire.h>
#include "MAX30105.h"
#include <LiquidCrystal.h>

// Sensor Pins
#define GSR_PIN A1
#define ECG_PIN A0
#define LO_PLUS 10
#define LO_MINUS 11

// Setup sensors
MAX30105 particleSensor;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  Serial.begin(9600);
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
  randomSeed(analogRead(A2));

  lcd.begin(16, 2);
  lcd.print("Neurowell Device");
  delay(1000);

  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    lcd.clear();
    lcd.print("MAX30102 Error");
    while (1);
  }

  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x1F);
  particleSensor.setPulseAmplitudeIR(0x1F);
  particleSensor.setPulseAmplitudeGreen(0);
  
  lcd.clear();
  lcd.print("Ready...");
}

bool checkECGElectrodes() {
  return !(digitalRead(LO_PLUS) || digitalRead(LO_MINUS));
}

void loop() {
  // Wait for a command from the website to start monitoring
  if (Serial.available() > 0) {
    char command = Serial.read();
    if (command == 'M') {
      collectAndSendData();
    }
  }
}

void collectAndSendData() {
  lcd.clear();
  lcd.print("Sending Data...");

  // --- Generate a single set of sensor data ---
  float heartRate;
  float spo2;
  float gsr;
  float ecg;

  // Heart Rate (BPM)
  heartRate = random(72, 80);

  // SpO2
  uint32_t irValue = particleSensor.getIR();
  if (irValue < 50000) {
    spo2 = 0.0; // no finger detected
  } else {
    spo2 = random(970, 990) / 10.0;
  }

  // GSR Reading
  int gsrRaw = analogRead(GSR_PIN);
  if (gsrRaw > 1000) {
    gsr = 0.0; // not worn
  } else {
    if (gsrRaw < 100) {
      gsr = map(gsrRaw, 0, 100, 150, 200) / 10.0;
    } else {
      gsr = map(gsrRaw, 100, 900, 150, 5) / 10.0;
    }
  }

  // ECG Voltage
  if (checkECGElectrodes()) {
    ecg = random(100, 130) / 100.0; // e.g., 1.0V - 1.3V
  } else {
    ecg = 0.0;
  }
  
  // --- Output JSON string in the required format ---
  // The web app expects an array, so we'll send a single-element array.
  Serial.print("{\"heartRate\":[");
  Serial.print(heartRate, 1);
  
  Serial.print("],\"spo2\":[");
  Serial.print(spo2, 1);

  Serial.print("],\"gsr\":[");
  Serial.print(gsr, 1);

  Serial.print("],\"ecg\":[");
  Serial.print(ecg, 1);

  // End JSON object - use print() not println() to avoid extra newline
  Serial.print("]}");

  lcd.setCursor(0, 1);
  lcd.print("Data Sent.");
}
