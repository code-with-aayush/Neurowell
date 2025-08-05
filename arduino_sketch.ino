
// A simple sketch to simulate reading sensor data and sending it over serial.
// Upload this to your Arduino UNO.

void setup() {
  // Start serial communication at 9600 bits per second:
  Serial.begin(9600);
}

void loop() {
  // Simulate reading sensor values
  float spo2 = 95.0 + (random(0, 100) / 100.0) * 5.0; // Simulate SpO2 between 95-100%
  float gsr = 1.5 + (random(0, 100) / 100.0) * 2.0;   // Simulate GSR
  int heartRate = 65 + random(0, 20);                  // Simulate Heart Rate between 65-85 BPM
  float ecg = 1.2 + (random(0, 100) / 100.0) * 0.6;    // Simulate ECG

  // Construct a JSON string with the sensor data
  String json = "{";
  json += "\"spo2\":";
  json += spo2;
  json += ",";
  json += "\"gsr\":";
  json += gsr;
  json += ",";
  json += "\"heartRate\":";
  json += heartRate;
  json += ",";
  json += "\"ecg\":";
  json += ecg;
  json += "}";

  // Send the JSON string over the serial port.
  // The newline character is important for the web app to know when a message ends.
  Serial.println(json);

  // Wait for a second before sending the next reading
  delay(1000);
}
