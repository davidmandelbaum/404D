import sys
import json

status = json.dumps({"time": "5", "depth": "30"})
sys.stdout.write(status + "\n")
