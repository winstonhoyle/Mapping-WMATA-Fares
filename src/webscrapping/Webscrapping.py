import requests
import csv
import GetField

##Get stations
shp = "../data/shapefile/Metro_Stations.shp"
stations = GetField.getField(shp, "STAT_NAME")

##Base url string
url = "https://www.wmata.com/node/wmata/wmataAPI/tripPlanner"

##Large CSV creation
##Contains all data
large_csv = open("../data/all_stations.csv", 'w', newline="")
large_filewriter = csv.writer(large_csv,delimiter=',', quotechar='|')
large_filewriter.writerow(["Dept","Arriv", "ST_Peak","ST_Offpeak","RedST_Peak","RedST_OffPeak"])

for depart_station in stations:
    ##Keep record of how many are incorrect
    incorrect = []

    ##Creation of individual csv file for each station
    csvfile = open('{}.csv'.format(depart_station), 'w', newline="")
    filewriter = csv.writer(csvfile, delimiter=',', quotechar='|')
    filewriter.writerow(["Station", "ST_Peak","ST_Offpeak","RedST_Peak","RedST_Offpeak"])

    for arriv_station in stations:
        ##If same station then give all values 0 except arrivial/departure station information
        if depart_station == arriv_station:
            z = 0
            filewriter.writerow([arriv_station,0,0,0,0])
            large_filewriter.writerow([depart_station,arriv_station,0,0,0,0])
            continue

        ##Parameters for the url in dictionary format
        ##FOR THIS TO WORK CHANGE THE MONTH AND DAY LEAVING
        ##CHECK METRO SCHEDULE TO ENSURE ALL STATIONS ARE OPERATING ON THOSE DATES
        peak = {"travelby":"CLR","arrdep":"D", "hour-leaving":7,"minute-leaving":30,"period-leaving":"AM","month-leaving":12,"day-leaving":10,"route":"T","walk-distance":0.75,"location":depart_station, "destination":arriv_station}
        offpeak = {"travelby":"CLR","arrdep":"D", "hour-leaving":1,"minute-leaving":55,"period-leaving":"PM","month-leaving":12,"day-leaving":10,"route":"T","walk-distance":0.75,"location":depart_station, "destination":arriv_station}
        
        ##Try/except block incase url doesn't go through
        try:
            ##Peak times url request and fare information
            r_peak = requests.get(url, params=peak)
            Smarttrip_peak = r_peak.json()["Response"]["Plantrip"]["Plantrip1"]["Itin"]["Extendedfare"]["Regular"]["Smartrip"]["Total"]
            RedSmarttrip_peak = r_peak.json()["Response"]["Plantrip"]["Plantrip1"]["Itin"]["Extendedfare"]["Reduced"]["Smartrip"]["Total"]

            ##Offpeak times url request and fare information
            r_offpeak = requests.get(url, params=offpeak)
            Smarttrip_offpeak = r_offpeak.json()["Response"]["Plantrip"]["Plantrip1"]["Itin"]["Extendedfare"]["Regular"]["Smartrip"]["Total"]
            RedSmarttrip_offpeak = r_offpeak.json()["Response"]["Plantrip"]["Plantrip1"]["Itin"]["Extendedfare"]["Reduced"]["Smartrip"]["Total"]

            ##Fare stats for individual
            fare_stats = [arriv_station,Smarttrip_peak,Smarttrip_offpeak,RedSmarttrip_peak,RedSmarttrip_offpeak]
            ##Fare stats for large file
            long_fare_stats = [depart_station,arriv_station,Smarttrip_peak,Smarttrip_offpeak,RedSmarttrip_peak,RedSmarttrip_offpeak]
            ##Writing stats to the csv
            filewriter.writerow(fare_stats)
            large_filewriter.writerow(long_fare_stats)
        
        ##Catching error
        except Exception as e:
            print(e)
            ##Append station and urls to incorrect list to keep track
            incorrect.append((arriv_station,r_peak.url,r_offpeak.url))
            ##Writing just station if error
            filewriter.writerow([arriv_station])
            large_filewriter.writerow([depart_station])

    csvfile.close()
    ##Printing station and how many errors if any per station
    print(depart_station, len(incorrect))

large_csv.close()
