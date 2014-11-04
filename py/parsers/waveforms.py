import sys
import csv
import glob
from xml.dom import minidom

if sys.argv[1]:
    filename = sys.argv[1]
else:
    sys.exit

if sys.argv[2]:
    mode = sys.argv[2]

doc = minidom.parse(filename)

if mode:
    samples = doc.getElementsByTagName(mode)[0].childNodes
else:
    samples = doc.getElementsByTagName("CompressionSamples")[0].childNodes

for s in samples:
    if s.attributes:
        print s.attributes["ms"].value + "," + s.childNodes[0].data
