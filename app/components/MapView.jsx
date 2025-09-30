import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

export default function MapView() {
  const [stations, setStations] = useState(null);
  const [lines, setLines] = useState(null);
  const [fareType, setFareType] = useState("");
  const [selectedLine, setSelectedLine] = useState("all");
  const [highlightedStation, setHighlightedStation] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // Load all stations and lines
  useEffect(() => {
    axios.get(`${API_BASE}/stations?line=all&geojson=true`).then((res) => setStations(res.data));
    axios.get(`${API_BASE}/lines`).then((res) => setLines(res.data));
  }, []);

  // Helper
  const getFareColor = (value) => {
    if (!fareType || value == null) return "#fff";
    switch (fareType) {
      case "peak":
        return value >= 6 ? "#d73027" :
               value >= 5 ? "#fc8d59" :
               value >= 4 ? "#fee08b" :
               value >= 3.5 ? "#ffffbf" :
               value >= 3 ? "#d9ef8b" :
               value >= 2.5 ? "#91cf60" :
               value >= 2 ? "#1a9850" : "#000";
      case "off_peak":
        return value >= 3.85 ? "#d7191c" :
               value >= 3.5 ? "#fdae61" :
               value >= 3 ? "#ffffbf" :
               value >= 2.5 ? "#a6d96a" :
               value >= 2 ? "#1a9641" : "#000";
      case "senior_disabled":
        return value >= 3 ? "#d7191c" :
               value >= 2.5 ? "#fdae61" :
               value >= 2 ? "#ffffbf" :
               value >= 1.5 ? "#a6d96a" :
               value >= 1 ? "#1a9641" : "#000";
      default:
        return "#fff";
    }
  };

  // Highlight station function (when user clicks)
  const onStationClick = async (feature) => {
    const stationCode = feature.properties.code;
    if (!fareType) return;

    // Fetch updated fares for this station from Lambda
    const res = await axios.get(`${API_BASE}/fare/${feature.properties.station_id}?geojson=true`);
    setHighlightedStation(res.data);
  };

  // Render station markers
  const renderStations = (geojsonData) => (
    <GeoJSON
      data={geojsonData}
      pointToLayer={(feature, latlng) => (
        <CircleMarker
          center={latlng}
          radius={5}
          color="#000"
          fillColor={
            highlightedStation?.features?.find(f => f.properties.code === feature.properties.code)
              ? "#000"
              : getFareColor(feature.properties[fareType])
          }
        >
          <Tooltip>
            <div>
              <strong>{feature.properties.name}</strong><br/>
              {fareType && `Fare: $${feature.properties[fareType]?.toFixed(2) || "N/A"}`}
            </div>
          </Tooltip>
        </CircleMarker>
      )}
      onEachFeature={(feature, layer) => {
        layer.on({ click: () => onStationClick(feature) });
      }}
    />
  );

  return (
    <div>
      <div>
        <label>Fare Type:</label>
        <select value={fareType} onChange={e => setFareType(e.target.value)}>
          <option value="">Select</option>
          <option value="peak">Peak</option>
          <option value="off_peak">Off-Peak</option>
          <option value="senior_disabled">Senior/Disabled</option>
        </select>

        <label>Line:</label>
        <select value={selectedLine} onChange={e => setSelectedLine(e.target.value)}>
          <option value="all">All</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="orange">Orange</option>
          <option value="yellow">Yellow</option>
          <option value="silver">Silver</option>
        </select>
      </div>

      <MapContainer
        center={[38.898303, -77.028099]}
        zoom={13}
        style={{ height: "90vh", width: "100%" }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {lines && <GeoJSON data={lines} style={{ color: "#009CDE", weight: 6 }} />}
        {stations && renderStations(stations)}
        {highlightedStation && renderStations(highlightedStation)}
      </MapContainer>
    </div>
  );
}
