from __future__ import division
from scipy import signal as sig
import numpy as np

def calc_offset(data):
    offset = 0
    if data[0][0] != 0:
        if data[0][0] % 10 != 0:
            offset = data[0][0] - (data[0][0] % 10)
        else:
            offset = data[0][0]
    return offset

def calc_comp_rate(y_vals, ms):
    if ms > 0:
        y = np.array(y_vals)
        max_extrema = sig.argrelextrema(y, np.greater)[0]
        compressions = max_extrema.size
        seconds = ms/1000
        rate = compressions/seconds*60
        return round(rate) 

def calc_comp_depth(y_vals, ms, data, window_vals):
    if ms > 0:
        depths = []
        y = np.array(y_vals)
        max_extrema = sig.argrelextrema(y, np.greater)[0]
        off = window_vals[0][0]
        for x in max_extrema:
            depths.append(window_vals[x][1])
        print max_extrema
        depths_np = np.array(depths)
        print depths_np
        avg_depth = np.mean(depths_np)
        return round(avg_depth)

def final_stats(y_vals, time_limit, data):
    stats = {}
    y_vals = np.array(y_vals)

    max_extrema = sig.argrelextrema(y_vals, np.greater)[0]

    compressions = max_extrema.size

    stats["total_compressions"] = str(compressions)
    # print "Total Compressions: " + str(compressions)
    seconds = time_limit/1000
    # print "Time: " + str(seconds) + "s"
    stats["time"] = str(seconds)
    rate = compressions/seconds*60
    # print "Average Compression Rate: " + str(rate)
    stats["rate"] = str(rate)

    depths = []
    for x in max_extrema:
        depths.append(data[x][1])

    depths_np = np.array(depths)

    avg_depth = np.mean(depths_np)

    # print "Average Compression Depth: " + str(avg_depth) + "mm"
    stats["depth"] = str(avg_depth)

    return stats
