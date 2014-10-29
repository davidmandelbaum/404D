void setup() {
  Serial.begin(9600);
  Serial.println("initialized");

}

void loop() {
  if (Serial.available())
  {
    int c = Serial.read();
    if (c == '?'){
      int sensorValue = analogRead(A0);
      float voltage = sensorValue * (1.8 / 1023.0);
      Serial.println(voltage);
    }
  }
}
