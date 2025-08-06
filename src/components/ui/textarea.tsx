
#include <LiquidCrystal.h>

// Initialize LCD
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
    Serial.begin(9600);
    lcd.begin(16, 2);
    randomSeed(analogRead(A2)); // Seed for random data

    lcd.print("Neurowell Device");
    lcd.setCursor(0, 1);
    lcd.print("Ready...");
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
    
    // Generate and send a single set of simulated sensor data
    int heartRate = random(70, 85);
    float spo2 = random(950, 990) / 10.0;
    float gsr = random(10, 50) / 10.0;
    float ecg = random(500, 1500) / 1000.0;

    // Start JSON object
    Serial.print("{\"heartRate\":[");
    Serial.print(heartRate);
    
    Serial.print("],\"spo2\":[");
    Serial.print(spo2);

    Serial.print("],\"gsr\":[");
    Serial.print(gsr);

    Serial.print("],\"ecg\":[");
    Serial.print(ecg);

    // End JSON object - use print() not println() to avoid extra newline
    Serial.print("]}");

    lcd.setCursor(0, 1);
    lcd.print("Data Sent.");
}
