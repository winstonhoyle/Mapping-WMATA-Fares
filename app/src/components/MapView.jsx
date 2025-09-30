import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView() {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [line, setLine] = useState("all");
    const [fareType, setFareType] = useState("all");
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const getLineColor = (color) => {
        switch (color) {
            case "red":
                return "#BF0D3E";
            case "orange":
                return "#ED8B00";
            case "blue":
                return "#009CDE";
            case "green":
                return "#00B140";
            case "yellow":
                return "#FFD100";
            case "silver":
                return "#919D9D";
            default:
                return "#000000";
        }
    };

    const getStationColor = (d) => {
        switch (fareType) {
            case "PeakTime":
                return d >= 6.0 ? '#d73027' :
                    d >= 5.0 ? '#fc8d59' :
                        d >= 4.0 ? '#fee08b' :
                            d >= 3.5 ? '#ffffbf' :
                                d >= 3.0 ? '#d9ef8b' :
                                    d >= 2.5 ? '#91cf60' :
                                        d >= 2.0 ? '#1a9850' :
                                            '#000000';

            case "OffPeakTime":
                return d === 3.85 ? '#d7191c' :
                    d >= 3.5 ? '#fdae61' :
                        d >= 3.0 ? '#ffffbf' :
                            d >= 2.5 ? '#a6d96a' :
                                d >= 2 ? '#1a9641' :
                                    '#000000';

            case "SeniorDisabled":
                return d === 3.00 ? '#d7191c' :
                    d >= 2.5 ? '#fdae61' :
                        d >= 2.0 ? '#ffffbf' :
                            d >= 1.5 ? '#a6d96a' :
                                d >= 1.0 ? '#1a9641' :
                                    '#000000';

            default:
                return '#FFFFFF';
        }
    };
    // Initialize the map
    useEffect(() => {
        const OSM = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            minZoom: 11,
            maxZoom: 15,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });

        const mapInstance = L.map(mapRef.current, {
            center: [38.898303, -77.028099],
            zoom: 13,
            layers: [OSM],
            zoomControl: false,
        });

        mapInstance.createPane("metro");
        mapInstance.createPane("stations");
        mapInstance.getPane("stations").style.zIndex = 999;
        mapInstance.getPane("metro").style.zIndex = 200;

        setMap(mapInstance);
    }, []);

    // Get Fares for Station
    const handleStationClick = useCallback(async (feature) => {
        const stationCode = feature.properties.Code;
        const fareValue = feature.properties[fareType] || 0;
        console.log(feature);
        // Remove previous highlighted stations if they exist
        if (map?.prevStationLayer) {
            map.removeLayer(map.prevStationLayer);
        }

        // Fetch fares for clicked station
        try {
            const res = await fetch(
                `https://uoo13y1xn3.execute-api.us-east-1.amazonaws.com/fares/${stationCode}`
            );
            const geojsonData = await res.json();

            // Add new layer for this station
            const newLayer = L.geoJson(geojsonData, {
                pointToLayer: (feature, latlng) =>
                    L.circleMarker(latlng, {
                        radius: 5,
                        color: "#000000",
                        fillColor: getStationColor(fareValue),
                        weight: 1
                    }).bindTooltip(
                        `${feature.properties.Name}<br>Fare: $${fareValue}`
                    ),
            }).addTo(map);

            // Store reference to remove later
            map.prevStationLayer = newLayer;
        } catch (err) {
            console.error("Failed to fetch station fares:", err);
        }
    }, [map, fareType]);


    // Fetch and render lines + stations whenever map is ready
    useEffect(() => {
        if (!map) return;

        let linesLayer;
        let stationsLayer;

        // Fetch all lines
        fetch(`${API_BASE_URL}/lines`)
            .then((res) => res.json())
            .then((linesData) => {
                linesLayer = L.geoJson(linesData, {
                    style: (feature) => ({
                        weight: 6,
                        color: getLineColor(feature.properties.NAME),
                    }),
                    pane: "metro",
                }).addTo(map);
            })
            .catch((err) => console.error("Failed to fetch lines:", err));

        // Fetch stations (all or by line)
        fetch(`${API_BASE_URL}/stations`)
            .then((res) => res.json())
            .then((stationsData) => {
                stationsLayer = L.geoJson(stationsData, {
                    pointToLayer: (feature, latlng) =>
                        L.circleMarker(latlng, {
                            radius: 5,
                            color: "#000000",
                            fillColor: "#ffffff",
                            fillOpacity: 1.0,
                        }).bindTooltip(feature.properties.Name),
                    pane: "stations",
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            click: () => handleStationClick(feature),
                        })
                    }
                }).addTo(map);

                map.fitBounds(stationsLayer.getBounds());
            });

        return () => {
            if (linesLayer) map.removeLayer(linesLayer);
            if (stationsLayer) map.removeLayer(stationsLayer);
        };
    }, [map, line, API_BASE_URL, handleStationClick]);


    return (
        <div>
            <div className="overlay" id="selections">
                <select value={line} onChange={(e) => setLine(e.target.value)}>
                    <option value="all">All</option>
                    <option value="silver">Silver</option>
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                </select>
                <select value={fareType} onChange={(e) => setFareType(e.target.value)}>
                    <option value="">Fare Type</option>
                    <option value="PeakTime">Peak</option>
                    <option value="OffPeakTime">Off-Peak</option>
                    <option value="SeniorDisabled">Senior Disabled</option>
                </select>
            </div>

            <div className="overlay" id="title">
                <center>
                    <h1>Mapping WMATA Fares</h1>
                    <h4>Version: 0.0.5</h4>
                    <h3>
                        GitHub:{" "}
                        <a href="https://github.com/winstonhoyle/Mapping-WMATA-Fares">
                            Mapping-WMATA-Fares
                        </a>
                    </h3>
                </center>
            </div>

            <div id="map" ref={mapRef} style={{ height: "100vh", width: "100%" }} />
        </div>
    );
}
