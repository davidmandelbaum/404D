int red = 12;
int green = 11;
int blue = 13;

void setup() {
  Serial.begin(9600);
  Serial.println("initialized");

  pinMode(red, OUTPUT);
  pinMode(blue, OUTPUT);
  pinMode(green, OUTPUT);
}

void loop() {
  if (Serial.available())
  {
    int c = Serial.read();
    if (c == '?'){
      int sensorValue = analogRead(A0);
      float voltage = sensorValue * (5.0 / 1023.0);
      Serial.println(voltage);
    }
    if (c == 'R'){
      digitalWrite(red, HIGH); 
    }
    if (c == 'r'){
      digitalWrite(red, LOW); 
    }
    
    if (c == 'G'){
      digitalWrite(green, HIGH);
    }
    if (c == 'g'){
      digitalWrite(green, LOW); 
    }
  }
}
