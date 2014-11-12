from __future__ import division
import sys
import numpy as np
import time as time
from scipy import signal as sig
from helpers import *
from capno_helpers import *
import serial
import csv as csv
import unirest
import json
import urllib

# init arduino
ser = serial.Serial('/dev/tty.usbserial-A602TSPH', 9600)
init = ser.readline()

try:
    time_limit = 30
    window_length = 5

    # globals
    y_vals = []
    y_vals_window = [(0, 0)]
    comp_rates = []
    comp_depths = []
    nums = np.arange(0, time_limit, 10)
    old_num = 0
    conversion = 3.84 # calculated given length of potentiometer
    ylim = 7
    comp_status = 0
    depth_status = 0
    second_values = []
    data = []

    # capno alg
    scores = []
    maxes = []
    mins = []
    score = 1250

    start_time = time.time()
    last_calc = time.time() - start_time

    # calibrate to initial depth
    ser.write('?')
    init_depth = float(ser.readline()[0:4])

    while True:
        now = round(time.time() - start_time, 4)

        if (now-last_calc) > 1 and now > 0 and len(y_vals_window) > 0:
            last_calc = now
            # every 1 second, make necessary calculations

            window_vals = [x[1] for x in y_vals_window]

            comp_rate = calc_comp_rate(window_vals,
                                       (y_vals_window[len(y_vals_window)-1][0] - y_vals_window[0][0] ))

            # comp rate

            comp_rates.append( (now, comp_rate) )

            comp_depth = calc_comp_depth(window_vals,
                                         (y_vals_window[len(y_vals_window)-1][0] - y_vals_window[0][0]),
                                         data,
                                         y_vals_window)
            # comp depth

            comp_depths.append( (now, comp_depth) )

            # LED screen output
            if comp_status == 1 and depth_status == 1:
                # if compressions are good, turn red light off and green light on
                ser.write('r')
                ser.write('G')
            else:
                ser.write('g')
                ser.write('R')

            values_out = json.dumps({ "second_values": second_values })
            sys.stdout.write(json.dumps(second_values))

            second_values = []

        if now > time_limit:
            break

        for y in y_vals_window:
            if y[0] < (now-window_length):
                y_vals_window.remove(y)

        ser.write('?')
        num_in = ser.readline()
        try:
            num_in = float(num_in[0:4])
            num_in -= init_depth
            num_in *= conversion
            # TODO: deal with issue of numbers not being the same
            if old_num != num_in:
                y_vals_window.append((now, num_in))
                y_vals.append((now, num_in))
                second_values.append((now, num_in))
                plt.figure(0)
                data.append((now, num_in))
                out.set_xdata(np.append(out.get_xdata(), now))
                out.set_ydata(np.append(out.get_ydata(), (num_in)))
                plt.draw()
            old_num = num_in

        except:
            print "ERR: num_in"

        # capno alg
        # TODO: change so adjusted for amount of time since last calculation
        if len(data) > 3:
            score = (score - 0.9)

            if score > 500:
                rise_rate = 5
            elif score <= 500:
                rise_rate = 3
            if data[-3][1] < data[-2][1] and data[-1][1] < data[-2][1]:
                maxes.append((data[-2][1], data[-2][0]))
                if len(maxes) > 2:
                    score = score + (rise_rate * max_alg(data[-2][1])) \
                                  + (rise_rate * time_alg(maxes[-1][0], maxes[-2][0]))

            if data[-3][1] > data[-2][1] and data[-1][1] > data[-2][1]:
                mins.append((data[-2][1], data[-2][0]))
                score = score + rise_rate * min_alg(data[-2][1])

            if score > 1250:
                score = 1250

            if score < 250:
                score = 250
            
            scores.append((data[-2][0], score))

            # send capno score

            print "score = " + str(score)

    stats = final_stats(y_vals, time_limit, data)

    # send final stats

    # open output file
    file_out = open('csv/out.csv', 'wb')
    writer = csv.writer(file_out)
    writer.writerow(['Time (s)', 'Depth (cm)'])
    for y in y_vals:
        writer.writerow([round(y[0], 4), round(y[1], 4)])

except:
    raise
