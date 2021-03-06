from __future__ import division
import sys
import numpy as np
from math import *

# CAPNOGRAPHY ALGORITHM VARIABLES (adjustable)
# --------------------------------------------

# Depth
mindepth = 4.7
maxdepth = 6.2

speed_ceiling = 140 # above this, rate is very poor
speed_floor = 80 # below this, rate is very poor

depthscore = 45
recoilscore = depthscore
ratescore = 1

#fallrate = 18
fallrate = 9 
#goodrise = 0.1
goodrise = 0.05 # everything but shallow makes sense at -0.2, shallow makes sense at 0.16
badrise = 0.6*goodrise # should still allow for rescue below 10mmHg w/ perfect CPR
constant = 100
maxscore = 1250
deathscore = 1250
neardeath = deathscore + ((maxscore-deathscore)/4)

slowpunish = 15 # how much we punish each slow compression
fastpunish = 200 # how much we punish each fast compression
depth_penalty = 300 # how much we punish for overly deep compressions
shallow_penalty = 170 # how much we punish for overly shallow compressions

def max_alg(depth):
    if mindepth < depth and depth < maxdepth:
        return depthscore
    elif depth > maxdepth:
        return (depthscore-(depth_penalty * (depth-maxdepth)))
    else:
        return (depthscore-(shallow_penalty * (mindepth-depth)))

def min_alg(depth):
    if depth == 0:
        return recoilscore
    else:
        return recoilscore-depth

def time_alg(current, last):
    if current == last:
        last = 1 # prevents first rate from reading as infinity

    rate = 60/(current-last)
    too_fast = 0
    too_slow = 0

    if rate > speed_ceiling:
        too_fast = 1

    if rate < speed_floor:
        too_slow = 1

    x = (ratescore * (110-pow((abs(110-rate)), 1.06)
        - (too_fast*fastpunish)
        - (too_slow*slowpunish)))

    return x

def scorefall(time_x, time_y):
    return fallrate*(time_x - time_y)
