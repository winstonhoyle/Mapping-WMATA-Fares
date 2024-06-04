/* This javascript page is for the line selection
 * functions for line manipulation
 */



function SelectLine() {

  color = document.getElementById("Line-selection").value

  if (typeof selectedLine !== 'undefined') {
    map.removeLayer(selectedLine);

  }
  if (typeof selectedStations !== 'undefined') {
    map.removeLayer(selectedStations);
  }

  if (color === 'all') {

    lines.addTo(map);
    stations.addTo(map);
    return
  }

  //removing other lines and stations
  map.removeLayer(lines);
  map.removeLayer(stations);

  switch (color) {
    case "silver":
      color_code = "SV"
      break;
    case "red":
      color_code = "RD"
      break;
    case "orange":
      color_code = "OR"
      break;
    case "yellow":
      color_code = "YL"
      break;
    case "blue":
      color_code = "BL"
      break;
    case "green":
      color_code = "GR"
      break;
  }

  // add lines geojson
  selectedStationsLineUrl = 'http://127.0.0.1:8000/line/' + color_code;
  const selectedStationsLineResp = fetch(selectedStationsLineUrl).then(response => response.json()).then(response => {
    selectedLine = L.geoJson(response, {
      style: function (features) {
        return {
          weight: 6,
          color: features.properties.name
        }
      },
      pane: "metro"
    }).addTo(map);
  })

  // add stations, they have a onEachFeature function and a circle marker
  selectedStationsUrl = 'http://127.0.0.1:8000/stations?line=' + color + '&geojson=true';
  const selectedStationsResp = fetch(selectedStationsUrl).then(response => response.json()).then(response => {
    selectedStations = L.geoJson(response, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          color: "#000000",
          fillColor: "#ffffff",
          fillOpacity: 1.0
        }).bindTooltip(feature.properties.name);
      },
      onEachFeature: onEachFeature,
      pane: "stations"
    }).addTo(map);
    map.fitBounds(selectedStations.getBounds());
  })

}
