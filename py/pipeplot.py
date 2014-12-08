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
    window_length = 6

    # globals
    y_vals = []
    y_vals_window = [(0, 0)]
    comp_rates = []
    comp_depths = []
    nums = np.arange(0, time_limit, 10)
    old_num = 0
    # conversion = 7.59
    conversion = 17
    ylim = 7
    comp_status = 0
    depth_status = 0
    second_values = []
    data = []
    send_freq = .1
    calc_freq = .95
    last_diff_val = 0

    # capno alg
    scores = []
    maxes = []
    mins = []
    score = int(sys.argv[2])
    fallrate = 18
    goodrise = 0.3 # everything but shallow makes sense at -0.2, shallow makes sense at 0.16
    badrise = 0.6*goodrise # should still allow for rescue below 10mmHg w/ perfect CPR
    constant = 100
    maxscore = 1250
    deathscore = 250
    neardeath = deathscore + ((maxscore-deathscore)/4)

    score = score*constant

    # TODO: fix calibration
    init_depth = round(ADC.read("P9_36"), 3) - .01

    begin = json.dumps({"begin": "true"})

    sys.stdout.write(begin + "\n")
    sys.stdout.flush()

    time.sleep(3)

    start_time = time.time()
    last_calc = time.time() - start_time
    last_send = time.time() - start_time

    while True:
        now = round(time.time() - start_time, 4)

        if (now-last_send) > send_freq and now > 0 and len(y_vals_window) > 0:
            last_send = now

            values_out = json.dumps({ "data_points": json.dumps(second_values) })
            sys.stdout.write(values_out + "\n")
            sys.stdout.flush()
            second_values = []

        if (now-last_calc) > calc_freq and now > 0 and len(y_vals_window) > 0:
            last_calc = now

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

            status_out = json.dumps({ "status_msg": { 
                                        "time": now,
                                        "rate": comp_rate,
                                        "depth": comp_depth,
                                        "capno": (score/constant) }})

            sys.stdout.write(status_out + "\n")
            sys.stdout.flush()

        if now > time_limit:
            break

        for y in y_vals_window:
            if y[0] < (now-window_length):
                y_vals_window.remove(y)

        num_in = ADC.read("P9_36")

        try:
            num_in -= init_depth
            if (num_in < 0):
                num_in = 0
            num_in *= conversion
            num_in = round(num_in, 2)
            time.sleep(.05)

            if abs(old_num - num_in) > 0.06:
                y_vals_window.append((now, num_in))
                y_vals.append((now, num_in))
                second_values.append((now, num_in))
                data.append((now, num_in))
                last_diff_val = now
            elif (now - last_diff_val) > 1:
                y_vals_window.append((now, old_num))
                y_vals.append((now, old_num))
                second_values.append((now, old_num))
                data.append((now, old_num))
                last_diff_val = now

            old_num = num_in

        except:
            print "ERR: num_in"

        # capno alg
        if len(data) > 3:
            score = (score - scorefall(data[-1][0], data[-2][0]))

            if score > neardeath:
                rise_rate = goodrise

            elif score <= neardeath:
                rise_rate = badrise

            if data[-3][1] < data[-2][1] and data[-1][1] < data[-2][1]:

                maxes.append((data[-2][1], data[-2][0]))

                if len(maxes) > 2:
                    score = score + (rise_rate * max_alg(data[-2][1])) \
                                  + (rise_rate * time_alg(maxes[-1][1], maxes[-2][1]))
                                  # should the previous line be [1] (time) or [0] (depth)??

            if data[-3][1] > data[-2][1] and data[-1][1] > data[-2][1]:
                mins.append((data[-2][1], data[-2][0]))
                score = score + (rise_rate*min_alg(data[-2][1]))

            if score < deathscore:
                score = 250
            
            scores.append((data[-2][0], (score/constant)))

    stats = final_stats(y_vals, time_limit, data)
    stats["capno"] = score/constant

    stats_out = json.dumps({ "final_stats": stats }) 
    sys.stdout.write(stats_out + "\n")
    sys.stdout.flush()

except:
    raise
