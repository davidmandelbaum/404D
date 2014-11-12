import sys
import json

data_points = []
data_points.append((1, 2))
data_points.append((2, 3))

status = json.dumps({ "data_points": data_points})
sys.stdout.write(status + "\n")

status = []
status.append((1, 2))
status_out = json.dumps({ "status_msg": status})
sys.stdout.write(status_out + "\n")
