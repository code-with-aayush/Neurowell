
#include <LiquidCrystal.h>

// Sensor Pins (using analog pins for simulation)
#define GSR_PIN A1
#define ECG_PIN A0

// Initialize LCD
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Data storage for 5 seconds of readings (1 reading/sec)
const int numReadings = 5;
int heartRateReadings[numReadings];
float spo2Readings[numReadings];
float gsrReadings[numReadings];
float ecgReadings[numReadings];

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
            collectData();
            sendData();
        }
    }
}

void collectData() {
    lcd.clear();
    lcd.print("Monitoring...");

    for (int i = 0; i < numReadings; i++) {
        // Display progress on LCD
        lcd.setCursor(0, 1);
        lcd.print("Reading ");
        lcd.print(i + 1);
        lcd.print("/");
        lcd.print(numReadings);

        // Generate simulated sensor data
        heartRateReadings[i] = random(70, 85);          // Stable heart rate
        spo2Readings[i] = random(950, 990) / 10.0;      // 95.0% to 99.0%
        gsrReadings[i] = random(10, 50) / 10.0;         // 1.0 to 5.0 uS
        ecgReadings[i] = random(500, 1500) / 1000.0;    // 0.5 to 1.5 mV

        delay(1000); // Wait 1 second between readings
    }
    
    lcd.clear();
    lcd.print("Monitoring Done!");
}

void sendData() {
    // Start JSON object
    Serial.print("{\"heartRate\":[");
    printIntArray(heartRateReadings, numReadings);
    
    Serial.print("],\"spo2\":[");
    printFloatArray(spo2Readings, numReadings);

    Serial.print("],\"gsr\":[");
    printFloatArray(gsrReadings, numReadings);

    Serial.print("],\"ecg\":[");
    printFloatArray(ecgReadings, numReadings);

    // End JSON object - use print() not println() to avoid extra newline
    Serial.print("]}");

    lcd.setCursor(0, 1);
    lcd.print("Data Sent.");
}

// Helper function to print an array of integers to JSON
void printIntArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        Serial.print(arr[i]);
        if (i < size - 1) {
            Serial.print(",");
        }
    }
}

// Helper function to print an array of floats to JSON
void printFloatArray(float arr[], int size) {
    for (int i = 0; i < size; i++) {
        Serial.print(arr[i]);
        if (i < size - 1) {
            Serial.print(",");
        }
    }
}

    