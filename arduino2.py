import serial

ser = serial.Serial('/dev/tty.usbserial-A602TSPH', 9600)

data = []

for num in range(0, 1000):
    data.append(ser.readline())

print data
