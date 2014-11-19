from __future__ import division
import Adafruit_BBIO.ADC as ADC
import sys
import numpy as np
import time as time
from helpers import *
from capno_helpers import *
import csv as csv
import json
import urllib

ADC.setup()

try:
    time_limit = int(sys.argv[1])
    window_length = 5

    # globals
    y_vals = []
    y_vals_window = [(0, 0)]
    comp_rates = []
    comp_depths = []
    nums = np.arange(0, time_limit, 10)
    old_num = 0
    conversion = 50 # calculated given length of potentiometer
    ylim = 7
    comp_status = 0
    depth_status = 0
    second_values = []
    data = []
    send_freq = .2

    # capno alg
    scores = []
    maxes = []
    mins = []
    score = int(sys.argv[2])

    start_time = time.time()
    last_calc = time.time() - start_time
    last_send = time.time() - start_time


    init_depth = 0
    # init_depth = round(ADC.read("P9_40"), 3)

    # TODO: initial depth calibration

    begin = json.dumps({"begin": "true"})

    sys.stdout.write(begin + "\n")
    sys.stdout.flush()

    while True:
        now = round(time.time() - start_time, 4)

        if (now-last_send) > send_freq and now > 0 and len(y_vals_window) > 0:
            last_send = now

            values_out = json.dumps({ "data_points": json.dumps(second_values) })
            sys.stdout.write(values_out + "\n")
            sys.stdout.flush()
            second_values = []

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

            # TODO: LCD screen output

            # LED screen output
            # if comp_status == 1 and depth_status == 1:
            #     # if compressions are good, turn red light off and green light on
            #     ser.write('r')
            #     ser.write('G')
            # else:
            #     ser.write('g')
            #     ser.write('R')

            status_out = json.dumps({ "status_msg": { 
                                        "time": now,
                                        "rate": comp_rate,
                                        "depth": comp_depth,
                                        "capno": score }})

            sys.stdout.write(status_out + "\n")
            sys.stdout.flush()

        if now > time_limit:
            break

        for y in y_vals_window:
            if y[0] < (now-window_length):
                y_vals_window.remove(y)

        num_in = ADC.read("P9_40")

        try:
            num_in -= init_depth
            num_in *= conversion
            num_in = round(num_in, 3)
            time.sleep(.05)
            # TODO: deal with issue of numbers not being the same
            if old_num != num_in:
                y_vals_window.append((now, num_in))
                y_vals.append((now, num_in))
                second_values.append((now, num_in))
                data.append((now, num_in))

                # TODO: test if socket can handle sending each point
                # point_out = json.dumps({ "data_point": (now, num_in) })
                # sys.stdout.write(point_out)
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
                    time_diff = maxes[-2][1] - maxes[-1][1]
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

            # TODO: send capno score more often?

    stats = final_stats(y_vals, time_limit, data)

    stats_out = json.dumps({ "final_stats": stats }) 
    sys.stdout.write(stats_out + "\n")
    sys.stdout.flush()

    # TODO: rewrite CSV writing on server side?

    # open output file
    file_out = open('../csv/out.csv', 'wb')
    writer = csv.writer(file_out)
    writer.writerow(['Time (s)', 'Depth (cm)'])
    for y in y_vals:
        writer.writerow([round(y[0], 4), round(y[1], 4)])

except:
    raise
