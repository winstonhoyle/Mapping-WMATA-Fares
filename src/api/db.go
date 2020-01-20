package main

import (
	"database/sql"
	/*"encoding/json"*/
	"fmt"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "winston"
	password = "winston"
	dbname   = "wmatafares"
)

type fare struct {
	fid     string
	dept    int
	arr     int
	peak    float64
	offpeak float64
	reduced float64
}

type Station struct {
	sid     int
	lines   string
	station string
}

func main() {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		panic(err)
	}
	/*
		row, err := db.Query(`SELECT fid, dept, arr, peak, offpeak, reduced FROM fares LIMIT 1`)
		fare := fare{}
		err = row.Scan(&fare.fid, &fare.dept, &fare.arr, &fare.peak, &fare.offpeak, &fare.reduced)
		if err != nil {
			fmt.Println(fare)
		} else {
			fmt.Println("ERROR")
		}
		stationData, err := db.Query(`SELECT json_build_object('type', 'Feature','geometry', ST_AsGeoJSON(geom)::json,'properties', json_build_object('lines', lines,'station', station)) FROM stations LIMIT 1;`)
	*/
	stationData, err := db.Query(`SELECT sid, lines, station FROM stations LIMIT 1`)
	s1 := new(Station)
	err = stationData.Scan(&s1.sid, &s1.lines, &s1.station)
	if err != nil {
		fmt.Println(s1)
	} else {
		fmt.Println("ERROR")
	}

}
