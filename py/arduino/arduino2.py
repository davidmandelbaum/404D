import serial

ser = serial.Serial('/dev/tty.usbserial-A602TSPH', 9600)
ser.readline()

for num in range(0, 1000):
    ser.write('?')
    print ser.readline()
