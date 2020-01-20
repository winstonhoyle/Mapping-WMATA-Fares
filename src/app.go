package main

import (
	"database/sql"
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

func main() {

	var (
		sid     int
		lines   string
		station string
		geom string
	)
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
	fmt.Println("Connected!")

	fmt.Println("Querying")

	rows, err := db.Query("SELECT sid, lines, station, ST_AsGeoJSON(geom) FROM stations")
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		fmt.Println("Scanning")
		err = rows.Scan(&sid, &lines, &station, &geom)
		if err != nil {
			panic(err)
		}

		fmt.Println(sid, lines, station, geom)
	}

}
