import csv
import json
from collections import defaultdict
from GetField import getField

jsonformat = defaultdict(list)

##Open csv
csvfile = open("../data/all_stations.csv", newline='')
dataList = list(csv.reader(csvfile,delimiter=","))[1:]
csvfile.close()

##Get Stations
stations = getField("../data/shapefile/Metro_Stations.shp", "STAT_NAME")

##Create dictionary
dic = {}
for station in stations:
    ##Create inner dictionary for fares
    fares = {}
    ##Loop through data
    for data in dataList:
        #print(station, data)
        if station == data[0]:
            fares[data[1]] = {"fares" : {"peak":data[2],"offpeak":data[3],"reduced_peak":data[4],"reduced_offpeak":data[5] }}
    dic["{}".format(station)] = fares

##Create a json file
with open("../data/all_stations.json", "w") as jsonfile:
    json.dump(dic, jsonfile)