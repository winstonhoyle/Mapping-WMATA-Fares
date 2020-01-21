package main

import (
	"fmt"
	"net/http"
	"strings"
)

func all_stations_handler(w http.ResponseWriter, r *http.Request) {
	keys := r.URL.Query().Get("names")
	if strings.ToLower(keys) == "true" {
		fmt.Fprintf(w, station_names())
		return
	}
	fmt.Fprintf(w, all_stations())

}

func all_lines_handler(w http.ResponseWriter, r *http.Request) {
	keys := r.URL.Query().Get("colors")
	if strings.ToLower(keys) == "true" {
		fmt.Fprintf(w, line_names())
		return
	}
	fmt.Fprintf(w, all_lines())
}
