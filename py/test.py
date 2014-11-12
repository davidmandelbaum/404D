import sys
import json

second_values = []
second_values.append((1, 2))
second_values.append((2, 3))

status = json.dumps({ "second_values": second_values})
sys.stdout.write(status + "\n")
