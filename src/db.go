package main

import (
	"fmt"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "winston"
	password = "winston"
	dbname   = "wmatafares"
)

func line_names() string {
	var colors string
	row := db.QueryRow("SELECT json_build_object('lines', json_agg(line)) FROM lines;")
	err := row.Scan(&colors)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	fmt.Println("data returned")
	return colors
}

func station_names() string {
	var names string
	row := db.QueryRow("SELECT json_build_object('stations', json_agg(station)) FROM stations;")
	err := row.Scan(&names)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	fmt.Println("data returned")
	return names
}

func all_stations() string {
	var stations string
	row := db.QueryRow("SELECT json_build_object( 'type', 'FeatureCollection', 'features', jsonb_agg(features.feature) ) FROM ( SELECT jsonb_build_object( 'type',       'Feature', 'id',         sid, 'geometry',   ST_AsGeoJSON(geom)::jsonb, 'properties', json_build_object('lines', lines, 'station', station) ) AS feature FROM (SELECT * FROM stations) inputs) features;")
	err := row.Scan(&stations)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	fmt.Println("data returned")
	return stations

}

func all_lines() string {
	var lines string
	row := db.QueryRow("SELECT json_build_object( 'type', 'FeatureCollection', 'features', jsonb_agg(features.feature) ) FROM ( SELECT jsonb_build_object( 'type',       'Feature', 'id',         lid, 'geometry',   ST_AsGeoJSON(geom)::jsonb, 'properties', json_build_object('line', line) ) AS feature FROM (SELECT * FROM lines) inputs) features;")
	err := row.Scan(&lines)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	fmt.Println("data returned")
	return lines

}

func all_fares() string {
	var fares string
	row := db.QueryRow("SELECT json_build_object( 'type', 'FeatureCollection', 'features', jsonb_agg(features.feature) ) FROM ( SELECT jsonb_build_object( 'type','Feature', 'id', fid, 'properties', json_build_object( 'peak', peak, 'offpeak', offpeak, 'reduced', reduced ) ) AS feature FROM ( SELECT fares.fid, dept.station, arr.station, peak, offpeak, reduced FROM fares LEFT JOIN stations dept ON fares.dept = dept.sid LEFT JOIN stations arr ON fares.arr = arr.sid ) fares_norm ) features;")
	err := row.Scan(&fares)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	fmt.Println("data returned")
	return fares
}

func all_fares_with_geom() string {
	var fares string
	row := db.QueryRow("SELECT json_build_object( 'type', 'FeatureCollection', 'features', jsonb_agg(features.feature) ) FROM ( SELECT jsonb_build_object( 'type','Feature', 'id', fid, 'geometry',ST_AsGeoJSON(geom)::jsonb, 'properties', json_build_object( 'peak', peak, 'offpeak', offpeak, 'reduced', reduced ) ) AS feature FROM ( SELECT fares.fid, dept.station, arr.station, peak, offpeak, reduced,arr.geom FROM fares LEFT JOIN stations dept ON fares.dept = dept.sid LEFT JOIN stations arr ON fares.arr = arr.sid ) fares_norm ) features;")
	err := row.Scan(&fares)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	fmt.Println("data returned")
	return fares
}
