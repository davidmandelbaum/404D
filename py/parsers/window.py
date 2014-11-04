from __future__ import division
import sys
import time
import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt
from scipy import signal as sig
from helpers import *
import curses as curses

print "Stdout (y)?"
input = raw_input()
if input == "y" or input == "Y":
    stdout = True
else:
    stdout = False

try:
    if not stdout:
        stdscr = curses.initscr()
        curses.start_color()
        curses.init_pair(1, curses.COLOR_RED, curses.COLOR_WHITE)
        curses.init_pair(2, curses.COLOR_WHITE, curses.COLOR_RED)
        curses.init_pair(3, curses.COLOR_WHITE, curses.COLOR_GREEN)
        stdscr.addstr("Time to plot (in seconds):")
        stdscr.refresh()
        time_limit = int(stdscr.getstr(1, 0))*1000
        stdscr.clear()
        stdscr.refresh()
        stdscr.addstr("Sliding window length (in seconds):")
        stdscr.refresh()
        window_length = int(stdscr.getstr(1, 0))*1000
        stdscr.clear()
        stdscr.refresh()
    else:
        print "Time to plot (in seconds):"
        time_limit = int(raw_input())*1000
        print "Sliding window length (in seconds):"
        window_length = int(raw_input())*1000
        start_time = time.time() 

    # read from file
    data_in = mpl.mlab.csv2rec(sys.argv[1], delimiter=',')
    data_dict = dict(data_in)

    # globals
    y_vals = []
    y_vals_window = [(0, 0)]
    comp_rates = []
    comp_depths = []
    offset = calc_offset(data_in)
    nums = np.arange(offset, offset+time_limit, 10)

    # init
    plt.ion()
    plt.figure(0)
    out, = plt.plot([], [])
    plt.ylim([60, 0])
    plt.xlim([0, time_limit])
    plt.show(block=False)
    plt.figure(1)
    out_rate, = plt.plot([], [])
    plt.ylim([0, 150])
    plt.xlim([0, time_limit])
    plt.show(block=False)
    plt.figure(0)

    if not stdout:
        stdscr.addstr(0, 18, "Time: ")
        stdscr.addstr(1, 0, "Current sliding window: ")
        stdscr.addstr(2, 6, "Compression Rate: ")
        stdscr.addstr(3, 5, "Compression Depth: ")
        stdscr.refresh()

    for num in nums:
        print "num = " + str(num)
        print "time = " + str(time.time())

        if not stdout:
            stdscr.addstr(0, 24, str(round((num-offset)/1000, 2)) + "s")
            stdscr.addstr(1, 24, ("[" + str(y_vals_window[0][0]) + ", " + str(y_vals_window[len(y_vals_window)-1][0]) + "]"))
            stdscr.refresh()

        if (num-offset) % 1000 == 0 and (num-offset) > 0:
            # every 1 second, make necessary calculations
            if stdout:
                print "time: " + str(num-offset) + "ms; window: [" + \
                                                   str(y_vals_window[0][0]) + ", " + \
                                                   str(y_vals_window[len(y_vals_window)-1][0]) + "]"
             

            # if stdout:
                # print y_vals_window
            window_vals = [x[1] for x in y_vals_window]

            comp_rate = calc_comp_rate(window_vals,
                                       (y_vals_window[len(y_vals_window)-1][0] - y_vals_window[0][0] ))

            print "longest run = " + str(longest_run(window_vals))

            if not stdout:
                if comp_rate > 130 or comp_rate < 100:
                    stdscr.addstr(2, 24, (str(comp_rate) + " Hz"), curses.color_pair(2))
                else:
                    stdscr.addstr(2, 24, (str(comp_rate) + " Hz"), curses.color_pair(3))

            else:
                print "Compression rate: " + str(comp_rate)
            comp_rates.append( (num-offset, comp_rate) )

            comp_depth = calc_comp_depth(window_vals,
                                         (y_vals_window[len(y_vals_window)-1][0] - y_vals_window[0][0]),
                                         data_in,
                                         y_vals_window)
            if not stdout:
                if comp_depth < 45 or comp_depth > 60:
                    stdscr.addstr(3, 24, (str(comp_depth) + " mm"), curses.color_pair(2))
                else:
                    stdscr.addstr(3, 24, (str(comp_depth) + " mm"), curses.color_pair(3))
            else:
                print "Depth: " + str(comp_depth)
            comp_depths.append( (num-offset, comp_depth) )

            if not stdout:
                stdscr.refresh()

            plt.figure(1)
            out_rate.set_xdata(np.append(out_rate.get_xdata(), num-offset))
            out_rate.set_ydata(np.append(out_rate.get_ydata(), comp_rate))
            plt.draw()

        if num in data_dict: 
            if (num-offset) > time_limit:
                break

            for y in y_vals_window:
                if y[0] < (num-offset-window_length):
                    y_vals_window.remove(y)
            y_vals_window.append((num-offset, data_dict[num]))

            y_vals.append(data_dict[num])
            plt.figure(0)
            out.set_xdata(np.append(out.get_xdata(), num-offset))
            out.set_ydata(np.append(out.get_ydata(), (1*data_dict[num])))
            plt.draw()

    stats = final_stats(y_vals, time_limit, data_in)

    if not stdout:
        stdscr.addstr(5, 4, ("Total compressions: " + stats["total_compressions"]))
        stdscr.addstr(6, 18, ("Time: " + stats["time"] + " s"))
        stdscr.addstr(7, 1, ("Avg. compression rate: " + stats["rate"] + " Hz"))
        stdscr.addstr(8, 0, ("Avg. compression depth: " + stats["depth"] + "mm"))
        stdscr.refresh()
    if stdout:
        print "Total compressions: " + stats["total_compressions"]
        print "Time: " + stats["time"] + " s"
        print "Avg. compression rate: " + stats["rate"] + " Hz"
        print "Avg. compression depth: " + stats["depth"] + "mm"
        
        curr_time = time.time()
        run_time = curr_time - start_time
        print "runtime = " + str(run_time)

    plt.show()

except:
    raise
    if not stdout:
        curses.nocbreak()
        stdscr.keypad(0)
        curses.echo()
        curses.endwin()
