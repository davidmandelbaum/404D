from __future__ import division
import sys
import numpy as np
import time as time
import matplotlib as mpl
import matplotlib.pyplot as plt
from scipy import signal as sig
from helpers import *
import curses as curses
import serial
import csv as csv
import unirest
import json
import urllib

# init arduino
ser = serial.Serial('/dev/tty.usbserial-A602TSPH', 9600)
init = ser.readline()

print "Stdout (y)?"
input = raw_input()
if input == "y" or input == "Y":
    stdout = True
else:
    stdout = False

# ask if user wants web output
print "Web output (y)?"
input = raw_input()
if input == "y" or input == "Y":
    web = True
else:
    web = False

# ask if user wants to send local or remote
print "Remote (r) or local (l)?"
input = raw_input()
if input == "r" or input == "R":
    address = "http://meng404d.herokuapp.com/"
elif input == "l" or input == "L":
    address = "http://localhost:3000/"


try:
    if not stdout:
        stdscr = curses.initscr()
        curses.start_color()
        curses.init_pair(1, curses.COLOR_RED, curses.COLOR_WHITE)
        curses.init_pair(2, curses.COLOR_WHITE, curses.COLOR_RED)
        curses.init_pair(3, curses.COLOR_WHITE, curses.COLOR_GREEN)
        stdscr.addstr("Time to plot (in seconds):")
        stdscr.refresh()
        time_limit = int(stdscr.getstr(1, 0))
        stdscr.clear()
        stdscr.refresh()
        stdscr.addstr("Sliding window length (in seconds):")
        stdscr.refresh()
        window_length = int(stdscr.getstr(1, 0))
        stdscr.clear()
        stdscr.refresh()
    else:
        print "Time to plot (in seconds):"
        time_limit = int(raw_input())
        print "Sliding window length (in seconds):"
        window_length = int(raw_input())

    data = []

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
    freq = .5 # sampling frequency

    # init
    plt.ion()
    plt.figure(0)
    out, = plt.plot([], [])
    plt.ylim([ylim, 0])
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

    start_time = time.time()
    last_calc = time.time() - start_time

    # calibrate to initial depth
    ser.write('?')
    init_depth = float(ser.readline()[0:4])

    while True:
        now = round(time.time() - start_time, 4)
        if not stdout:
            stdscr.addstr(0, 24, str(now) + "s")
            if len(y_vals_window) > 0:
                stdscr.addstr(1, 24, ("[" + str(y_vals_window[0][0]) + ", " + str(y_vals_window[len(y_vals_window)-1][0]) + "]"))
            stdscr.refresh()

        if (now-last_calc) > freq and now > 0 and len(y_vals_window) > 0:
            last_calc = now
            # every 1 second, make necessary calculations
            if stdout:
                print "time: " + str(now) + "s; window: [" + \
                                                   str(y_vals_window[0][0]) + ", " + \
                                                   str(y_vals_window[len(y_vals_window)-1][0]) + "]"

            if stdout:
                print y_vals_window
            window_vals = [x[1] for x in y_vals_window]

            comp_rate = calc_comp_rate(window_vals,
                                       (y_vals_window[len(y_vals_window)-1][0] - y_vals_window[0][0] ))
            if not stdout:
                if comp_rate > 130 or comp_rate < 100:
                    comp_status = 0
                    stdscr.addstr(2, 24, (str(comp_rate) + " /m"), curses.color_pair(2))
                else:
                    comp_status = 1
                    stdscr.addstr(2, 24, (str(comp_rate) + " /m"), curses.color_pair(3))
            else:
                print "Compression rate: " + str(comp_rate)

            comp_rates.append( (now, comp_rate) )

            comp_depth = calc_comp_depth(window_vals,
                                         (y_vals_window[len(y_vals_window)-1][0] - y_vals_window[0][0]),
                                         data,
                                         y_vals_window)
            if not stdout:
                if comp_depth < 4 or comp_depth > 6.0:
                    stdscr.addstr(3, 24, (str(comp_depth) + " cm"), curses.color_pair(2))
                    depth_status = 0
                else:
                    depth_status = 1
                    stdscr.addstr(3, 24, (str(comp_depth) + " cm"), curses.color_pair(3))
            else:
                print "Depth: " + str(comp_depth)
            comp_depths.append( (now, comp_depth) )

            if comp_status == 1 and depth_status == 1:
                # if compressions are good, turn red light off and green light on
                ser.write('r')
                ser.write('G')
            else:
                ser.write('g')
                ser.write('R')

            if not stdout:
                stdscr.refresh()

            if web:
                thread = unirest.post(address + "status", params={ "time": now,
                                                                            "rate": comp_rate,
                                                                           "depth": comp_depth })
                thread = unirest.post(address + "data_points", params={ "points": json.dumps(second_values) })

            second_values = []

            plt.figure(1)
            out_rate.set_xdata(np.append(out_rate.get_xdata(), now))
            out_rate.set_ydata(np.append(out_rate.get_ydata(), comp_rate))
            plt.draw()

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

    stats = final_stats(y_vals, time_limit, data)

    if not stdout:
        stdscr.addstr(5, 4, ("Total compressions: " + stats["total_compressions"]))
        stdscr.addstr(6, 18, ("Time: " + stats["time"] + " s"))
        stdscr.addstr(7, 1, ("Avg. compression rate: " + stats["rate"] + " /m"))
        stdscr.addstr(8, 0, ("Avg. compression depth: " + stats["depth"] + "cm"))
        stdscr.refresh()
    if stdout:
        print "Total compressions: " + stats["total_compressions"]
        print "Time: " + stats["time"] + " s"
        print "Avg. compression rate: " + stats["rate"] + " /m"
        print "Avg. compression depth: " + stats["depth"] + "cm"

    if web:
        thread = unirest.post(address + "final_stats", 
                              params={ "time":               stats["time"], 
                                       "total_compressions": stats["total_compressions"],
                                       "rate":               stats["rate"],
                                       "depth":              stats["depth"] })

    # open output file
    file_out = open('csv/out.csv', 'wb')
    writer = csv.writer(file_out)
    writer.writerow(['Time (s)', 'Depth (cm)'])
    for y in y_vals:
        writer.writerow([round(y[0], 4), round(y[1], 4)])

    plt.show()

    if not stdout:
        curses.nocbreak()
        stdscr.keypad(0)
        curses.echo()
        curses.endwin()

except:
    if not stdout:
        curses.nocbreak()
        stdscr.keypad(0)
        curses.echo()
        curses.endwin()
    raise
