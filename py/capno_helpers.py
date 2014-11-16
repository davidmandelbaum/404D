from __future__ import division
import sys
import numpy as np
from math import *

# CAPNOGRAPHY ALGORITHM VARIABLES (adjustable)
# --------------------------------------------

# Depth
min_acceptable_depth = 4
max_acceptable_depth = 5

def max_alg(depth):
    depth = depth/10
    if min_acceptable_depth < depth and depth < max_acceptable_depth:
        return 2.5
    elif depth > max_acceptable_depth:
        return (1-(10*depth-5))
    else:
        return (2.5 - (2 - (0.25*sqrt(depth))))

def min_alg(depth):
    depth = depth/10
    if depth == 0:
        return 1
    else:
        return 1-depth

def time_alg(current, last, diff):
    # TODO: use diff to calculate accurate time interval
    # diff *= 100
    rate = (current - last)/100
    if 0.5 < rate and rate < 0.6:
        return 1
    elif 0.3 < rate and rate < 0.8:
        return (1 - (2*abs(0.55-rate)))
    else:
        return 0
