/* This javascript page is for the line selection
 * functions for line manipulation
 */

//Get fare information for a station
function UpdateStationsOnLine(color, stationCode) {

  // Remove colored stations if it exists
  if (typeof updatedStationsOnLine !== 'undefined') {
    map.removeLayer(updatedStationsOnLine)
  }

  // Get station id from station code
  getStationUrl = 'http://127.0.0.1:8000/station?code=' + stationCode

  // Get station code
  $.ajax({
    url: getStationUrl,
    async: false,
    dataType: 'json',
    success: function (data) {
      stationId = data.station_id;
    }
  });

  // Get all fares for that station
  color = document.getElementById("Line-selection").value
  getFaresOnLineUrl = 'http://127.0.0.1:8000/fare/' + stationId + '?geojson=true&color=' + color
  $.ajax({
    url: getFaresOnLineUrl,
    async: false,
    dataType: 'json',
    success: function (data) {
      stationGeoJSONdata = data
      updatedStationsOnLine = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 5,
            color: "#000000",
            fillColor: "#ffffff",
            fillOpacity: 1.0
          }).bindTooltip(feature.properties.name);
        },
        onEachFeature: onEachFeatureStationsOnLine,
        pane: "stations"
      }).addTo(map);
      map.removeLayer(stations)
    }
  });

}

//highlight station function
function highlightFeatureStationLines(e) {

  fareType = document.getElementById("Fare-selection").value;

  // If drop down empty
  if (fareType == '') {
    return
  }

  var stationCode = e.target.feature.properties.code;

  UpdateStationsOnLine(e.target.feature.code, stationCode);
  updatedStationsOnLine.eachLayer(function (layer) {
    fare = layer.feature.properties[fareType];
    layer.setStyle({
      radius: 5,
      color: "#000000",
      fillColor: getColor(fare),
      weight: 1
    }).bindTooltip("<center>" + layer.feature.properties.name + "<br>" + "Fare: $" + fare.toFixed(2) + "</center>");

  });

  // Add legend
  map.addControl(legend);
}


function onEachFeatureStationsOnLine(feature, layer) {
  layer.on({
    click: highlightFeatureStationLines
  });
}

function ChangeFare() {

  console.log(document.getElementById("Fare-selection").value)

  if (document.getElementById("Fare-selection").value === '') {
    lines.addTo(map);
    stations.addTo(map);
    map.fitBounds(lines.getBounds());
    document.getElementById("Line-selection").selectedIndex = 0;
    return
  }

  if (typeof selectedLine !== 'undefined') {
    map.removeLayer(selectedLine);
  }
  if (typeof selectedStations !== 'undefined') {
    map.removeLayer(selectedStations);
  }
  if (typeof updatedStationsOnLine !== 'undefined') {
    map.removeLayer(updatedStationsOnLine);
  }

  SelectLine()

}


function SelectLine() {

  color = document.getElementById("Line-selection").value

  if (typeof selectedLine !== 'undefined') {
    map.removeLayer(selectedLine);

  }
  if (typeof selectedStations !== 'undefined') {
    map.removeLayer(selectedStations);
  }
  if (typeof updatedStationsOnLine !== 'undefined') {
    map.removeLayer(updatedStationsOnLine);
  }

  if (color === 'all') {

    lines.addTo(map);
    stations.addTo(map);
    map.fitBounds(lines.getBounds());
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
      onEachFeature: onEachFeatureStationsOnLine,
      pane: "stations"
    }).addTo(map);
    map.fitBounds(selectedStations.getBounds());
  })

}
