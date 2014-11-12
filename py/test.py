from __future__ import division
import sys
import json
from time import sleep

status = {}
status['time'] = 5
status['depth'] = 4
status['rate'] = 110
status['capno'] = 1000
status_out = json.dumps({ "status_msg": status})
sys.stdout.write(status_out + "\n")

# nums = range(0, 300, 1)
# nums = [x/10 for x in nums]
# for n in nums:
#     data_point = []
#     data_point.append((n, round((n%1), 2)))
#     data_point_out = json.dumps({ "data_point": data_point })
#     sys.stdout.write(data_point_out + "\n")
#     # sleep(0.1)

sys.stdout.write("end!")

# final_stats = {}
# final_stats['time'] = 100
# final_stats['depth'] = 20
# final_stats_out = json.dumps({ "final_stats": final_stats })
# sys.stdout.write(final_stats_out + "\n")
