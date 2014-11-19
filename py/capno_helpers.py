from __future__ import division
import sys
import numpy as np
from math import *

# CAPNOGRAPHY ALGORITHM VARIABLES (adjustable)
# --------------------------------------------

# Depth
mindepth = 4.7
maxdepth = 6.2
depthscore = 2.5
recoilscore = 1

def max_alg(depth):
    depth = depth/10
    if mindepth < depth and depth < maxdepth:
        return depthscore
    elif depth > maxdepth:
        return (depthscore-(10*(depth-maxdepth)))
    else:
        return (depthscore-(sqrt(mindepth)-(0.25*sqrt(depth))))

def min_alg(depth):
    depth = depth/10
    if depth == 0:
        return recoilscore
    else:
        return recoilscore-depth

def time_alg(current, last):
    current *= 100
    last *= 100
    rate = (current - last)*60000
    if 100 < rate and rate < 120:
        return 1
    elif 60 < rate and rate < 160:
        return (1 - (2 * abs(110 - rate)))
    else:
        return 0
