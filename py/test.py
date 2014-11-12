import sys
import json

status = {}
status['time'] = 5
status['depth'] = 4
status['rate'] = 110
status['capno'] = 1000
status_out = json.dumps({ "status_msg": status})
sys.stdout.write(status_out + "\n")

data_point = []
data_point.append((1, 2))
data_point_out = json.dumps({ "data_point": data_point })
sys.stdout.write(data_point_out + "\n")

final_stats = {}
final_stats['time'] = 100
final_stats['depth'] = 20
final_stats_out = json.dumps({ "final_stats": final_stats })
# sys.stdout.write(final_stats_out + "\n")
