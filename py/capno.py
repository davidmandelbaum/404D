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

plt.ion()

data = mpl.mlab.csv2rec(sys.argv[1], delimiter=',')

def max_alg(depth):
    depth = depth/10
    if 4 < depth and depth < 5:
        return 2.5
    elif depth > 5:
        return (1-(10*depth-5))
    else:
        return (2.5 - (2 - (0.25*sqrt(depth))))

def min_alg(depth):
    depth = depth/10
    if depth == 0:
        return 1
    else:
        return 1-depth

def time_alg(current, last):
    rate = (current - last)/100
    if 0.5 < rate and rate < 0.6:
        return 1
    elif 0.3 < rate and rate < 0.8:
        return (1 - (2*abs(0.55-rate)))
    else:
        return 0

def cap_score(data, start):
    allmax = []
    allmin = []
    allscore = []

    score = start
    
    nums = np.arange(0, len(data)) 

    for x in nums:
        score = (score - 0.9)

        if score > 500:
            rise_rate = 5
        elif score <= 500:
            rise_rate = 3
        if data[i-2][1] < data[i-1][1] and data[i][1] < data[i-1][1]:
            allmax.append((data[i-1][0], data[i-1][1]))
            score = score + rise_rate * max_alg(data[i-1][1]) \
                          + rise_rate * time_alg(allmax[-1][0], allmax[-2][0])

        if data[i-2][1] > data[i-1][1] and data[i][1] > data[i-1][1]:
            allmin.append((data[i-1][0], data[i-1][1]))
            score = score + rise_rate * min_alg(data[i-1][1])

        if score > 1250:
            score = 1250

        if score < 250:
            print "point of no return"
            return

        allscore.append((data[i-1][0], score))

        print "time = " + str(data[i-1][0])
        print "score = " + str(score)
