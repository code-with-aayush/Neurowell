
#include <Wire.h>
#include "MAX30105.h" // Assuming this is for MAX30102

// Sensor Pins
#define GSR_PIN A1
#define ECG_PIN A0

// Initialize MAX30102
MAX30105 particleSensor;

// Helper function to get a random float
float randomFloat(float min, float max) {
  return min + (float)random(0, 1000) / 1000.0 * (max - min);
}


void setup() {
    Serial.begin(9600);
    
    // Seed the random number generator
    randomSeed(analogRead(A2)); // Use an unused analog pin for a better seed
    
    // Initialize MAX30102
    if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
        // Loop forever if sensor not found
        while (1) {
          Serial.println("{\"error\": \"MAX30102 not found!\"}");
          delay(1000);
        };
    }
    particleSensor.setup(); // Configure sensor with default settings
    particleSensor.setPulseAmplitudeRed(0x1F); // Set Red LED to full power
    particleSensor.setPulseAmplitudeIR(0x1F);  // Set IR LED to full power
}

void loop() {
    // Simulate sensor readings
    float heartRate = randomFloat(65.0, 85.0); // BPM
    float spo2 = randomFloat(95.0, 99.5);
    float gsr = randomFloat(0.5, 3.0); // microSiemens (uS)
    float ecg = randomFloat(0.8, 1.5); // millivolts (mV)

    // Construct JSON string
    String json = "{";
    json += "\"heartRate\":";
    json += heartRate;
    json += ",\"spo2\":";
    json += spo2;
    json += ",\"gsr\":";
    json += gsr;
    json += ",\"ecg\":";
    json += ecg;
    json += "}";

    // Send JSON over serial
    Serial.println(json);

    // Wait for a second before sending the next batch of data
    delay(1000);
}

    