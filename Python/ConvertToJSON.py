import csv
import json
from collections import defaultdict
import GetField

jsonformat = defaultdict(list)

##Open csv
csvfile = open("all_stations.csv", newline='')
filereader = csv.reader(csvfile,delimiter=",",quotechar="|")
##Skip column names
next(filereader, None)

##Loop through every row appending station and fare info
for row in filereader:
    fares = {row[1] : {"fares" : {"peak":row[2],"offpeak":row[3],"reduced_peak":row[4],"reduced_offpeak":row[5] }}}
    jsonformat[row[0]].append(fares)

csvfile.close()

##Create a json file
with open("all_stations.json", "w") as jsonfile:
    json.dump(jsonformat,jsonfile,indent=1)
