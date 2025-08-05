#include <LiquidCrystal.h>

// -- Configuration --
// Initialize the LiquidCrystal library with the numbers of the interface pins
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Variables for cycling through display values
int displayState = 0;
unsigned long lastDisplayChangeTime = 0;
const int DISPLAY_INTERVAL = 2000; // 2 seconds

void setup() {
  // Start serial communication at 9600 bits per second:
  Serial.begin(9600);
  
  // Set up the LCD's number of columns and rows:
  lcd.begin(16, 2);
  
  // Seed the random number generator with an unused analog pin for better randomness
  randomSeed(analogRead(A0)); 
  
  lcd.print("Device Ready");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  delay(1500);
}

void loop() {
  // --- 1. Simulate Sensor Readings ---
  // These values are designed to look like real data.
  int heartRate = random(65, 85);       // Typical resting heart rate
  float spo2 = random(950, 995) / 10.0; // Normal SpO2 is 95-100%
  float gsr = random(10, 50) / 10.0;    // Galvanic Skin Response (stress)
  float ecg = random(500, 1500) / 1000.0; // ECG signal voltage

  // --- 2. Create JSON String ---
  // This format must exactly match what the web dashboard expects.
  // Example: {"heartRate":75,"spo2":98.5,"gsr":2.5,"ecg":1.23}
  String jsonString = "{";
  jsonString += "\"heartRate\":" + String(heartRate) + ",";
  jsonString += "\"spo2\":" + String(spo2, 1) + ",";
  jsonString += "\"gsr\":" + String(gsr, 1) + ",";
  jsonString += "\"ecg\":" + String(ecg, 2);
  jsonString += "}";

  // --- 3. Send JSON to Web Page ---
  // The 'println' adds a newline character, which helps the web page know when a message is complete.
  Serial.println(jsonString);

  // --- 4. Update LCD Display ---
  // This section cycles through showing each vital sign on the LCD.
  unsigned long currentTime = millis();
  if (currentTime - lastDisplayChangeTime > DISPLAY_INTERVAL) {
    lastDisplayChangeTime = currentTime;
    displayState = (displayState + 1) % 3; // Cycle through 3 states (0, 1, 2)
    
    lcd.clear();
    lcd.setCursor(0, 0);

    switch (displayState) {
      case 0:
        lcd.print("HR: ");
        lcd.print(heartRate);
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
    // Indicate that data is being sent
    lcd.setCursor(0, 1);
    lcd.print("Status: Sending");
  }
  
  // Wait for a second before the next loop
  delay(1000); 
}
