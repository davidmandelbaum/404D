from __future__ import division
from scipy import signal as sig
from extrema import extrema
import numpy as np

def calc_offset(data):
    offset = 0
    if data[0][0] != 0:
        if data[0][0] % 10 != 0:
            offset = data[0][0] - (data[0][0] % 10)
        else:
            offset = data[0][0]
    return offset

def calc_comp_rate(y_vals, s):
    if s > 0:
        if len(y_vals) > 0:
            y = np.array(y_vals)
            max_extrema = extrema(y, True, False)[0]
            compressions = max_extrema.size
            rate = compressions/s*60
        else:
            rate = 0
        return round(rate) 

def calc_comp_depth(y_vals, s, data, window_vals):
    if s > 0:
        if len(y_vals) > 0:
            depths = []
            y = np.array(y_vals)
            max_extrema = extrema(y, True, False)[0]
            off = window_vals[0][0]
            for x in max_extrema:
                depths.append(window_vals[x][1])
            depths_np = np.array(depths)
            if len(depths_np) > 0:
                avg_depth = np.mean(depths_np)
            else:
                avg_depth = 0
        else:
            avg_depth = 0
        return round(avg_depth, 3)

def final_stats(y_vals, time_limit, data):
    stats = {}
    oned_yvals = []
    for y in y_vals:
        oned_yvals.append(y[1])
    y_vals = np.array(oned_yvals)

    max_extrema = extrema(y_vals, True, False)[0]

    compressions = max_extrema.size

    stats["total_compressions"] = str(compressions)
    # print "Total Compressions: " + str(compressions)
    seconds = time_limit
    # print "Time: " + str(seconds) + "s"
    stats["time"] = str(seconds)
    rate = compressions/seconds*60
    # print "Average Compression Rate: " + str(rate)
    stats["rate"] = str(round(rate, 2))

    depths = []
    for x in max_extrema:
        depths.append(data[x][1])

    depths_np = np.array(depths)

    if len(depths_np) > 0:
        avg_depth = np.mean(depths_np)

    # print "Average Compression Depth: " + str(avg_depth) + "mm"
    stats["depth"] = str(round(avg_depth, 2))

    return stats
