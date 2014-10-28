from __future__ import division
import sys
import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt
import serial
from scipy import signal as sig

plt.ion()

# read from arduino
ser = serial.Serial('/dev/tty.usbserial-A602TSPH', 9600)

data = mpl.mlab.csv2rec(sys.argv[1], delimiter=',')
offset = 0
if data[0][0] != 0:
    if data[0][0] % 10 != 0:
        offset = data[0][0] - (data[0][0] % 10)
    else:
        offset = data[0][0]
data_dict = dict(data)
plt.figure(0)
out, = plt.plot([], [])
plt.ylim([0, 60])
plt.xlim([0, 10000])
plt.show(block=False)

def comps_per_min(y_vals, ms):
    if ms > 0:
        y = np.array(y_vals)
        max_extrema = sig.argrelextrema(y, np.greater)
        compressions = max_extrema[0].size
        seconds = ms/1000
        rate = compressions/seconds*60
        print "Compression rate: " + str(rate)

nums = np.arange(offset, offset+10000, 10)

if len(sys.argv) > 2:
    data2 = mpl.mlab.csv2rec(sys.argv[2], delimiter=',')
    data2_dict = dict(data2)
    plt.figure(1)
    out2, = plt.plot([], [])
    plt.ylim([0, 150])
    plt.xlim([0, 10000])
    plt.show(block=False)

y_vals = []

for num in nums:
    if (num-offset) % 1000 == 0:
        comps_per_min(y_vals, num-offset)
    if num in data_dict:
        if (num-offset) > 10000:
            break
        y_vals.append(data_dict[num])
        out.set_xdata(np.append(out.get_xdata(), num-offset))
        out.set_ydata(np.append(out.get_ydata(), data_dict[num]))
        plt.figure(0)
        plt.draw()

y_vals = np.array(y_vals)

max_extrema = sig.argrelextrema(y_vals, np.greater)[0]

compressions = max_extrema.size

print "Total Compressions: " + str(compressions)
print "Time: 10s"
print "Average Compressions Rate: " + str(compressions*6)

print "Max extrema:"
print max_extrema

depths = []
for x in max_extrema:
    depths.append(data[x][1])

print "depths: "
print depths

depths_np = np.array(depths)

avg_depth = np.mean(depths_np)

print "Average Compression Depth: " + str(avg_depth) + "mm"

plt.show()
