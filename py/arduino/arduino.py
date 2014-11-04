from __future__ import division
from Arduino import Arduino

board = Arduino('9600', '/dev/tty.usbserial-A602TSPH')

while True:
    try:
        val = board.analogRead(0)
        voltage = val * (5.0 / 1023.0)
        print voltage
    except:
        print "N/A"
