// This is the Arduino sketch. You should upload this to your Arduino UNO.

#include <LiquidCrystal.h>

// Initialize the library with the numbers of the interface pins
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Sensor Pins (for when you integrate them)
#define GSR_PIN A1
#define ECG_PIN A0

void setup() {
  Serial.begin(9600);
  
  // set up the LCD's number of columns and rows:
  lcd.begin(16, 2);
  
  // Use an unused analog pin to seed the random number generator
  randomSeed(analogRead(A2)); 

  lcd.print("Device Ready");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  delay(2000);
}

void loop() {
  // --- Simulate Sensor Readings ---
  // Once the connection is stable, you can replace these with your actual sensor reading functions.
  float heartRate = random(70, 95);          // Normal resting heart rate
  float spo2 = random(950, 999) / 10.0;      // SpO2 percentage
  float ecg = random(0, 1023) / 1023.0 * 3.3; // ECG value (normalized to voltage for example)
  float gsr = random(200, 800) / 100.0;      // GSR in microSiemens

  // --- Display on LCD ---
  // The display will cycle through the values every few seconds
  static int displayState = 0;
  
  lcd.clear();
  lcd.setCursor(0, 0);

  switch(displayState) {
    case 0:
      lcd.print("HR: ");
      lcd.print((int)heartRate);
      lcd.print(" BPM");
      break;
    case 1:
      lcd.print("SpO2: ");
      lcd.print(spo2, 1);
      lcd.print("%");
      break;
    case 2:
      lcd.print("GSR: ");
      lcd.print(gsr, 1);
      lcd.print(" uS");
      break;
  }

  displayState = (displayState + 1) % 3; // Cycle through 0, 1, 2


  // --- Send data as a JSON string to Serial ---
  // This is the format the website expects
  Serial.print("{");
  Serial.print("\"heartRate\":");
  Serial.print(heartRate);
  Serial.print(",");
  Serial.print("\"spo2\":");
  Serial.print(spo2);
  Serial.print(",");
  Serial.print("\"ecg\":");
  Serial.print(ecg);
  Serial.print(",");
  Serial.print("\"gsr\":");
  Serial.print(gsr);
  Serial.println("}"); // Use println to add a newline, which signifies the end of the message

  // Wait for 1 second before sending the next set of data
  delay(1000);
}
