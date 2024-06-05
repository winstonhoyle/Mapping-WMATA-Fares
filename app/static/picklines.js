/* This javascript page is for the line selection
 * functions for line manipulation
 */

//Get fare information for a station
async function UpdateStationsOnLine(color, stationCode) {

  // Remove colored stations if it exists
  if (typeof updatedStationsOnLine !== 'undefined') {
    map.removeLayer(updatedStationsOnLine)
  }

  // Get station id from station code
  let stationId
  await getStationId(stationCode).then(data => {
    stationId = data.station_id
  });

  // Get all fares for that station
  color = document.getElementById("Line-selection").value;
  getFaresOnLineUrl = '/fare/' + stationId + '?geojson=true&color=' + color;
  const getFaresOnLineResp = await fetch(getFaresOnLineUrl).then(response => response.json()).then(response => {
    updatedStationsOnLine = L.geoJson(response, {
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
    map.removeLayer(stations);
    return updatedStationsOnLine
  });

}

//highlight station function
async function highlightFeatureStationLines(e) {

  fareType = document.getElementById("Fare-selection").value;

  // If drop down empty
  if (fareType == '') {
    return
  }

  var stationCode = e.target.feature.properties.code;

  updatedStationsOnLinec = await UpdateStationsOnLine(e.target.feature.code, stationCode);
  updatedStationsOnLine.eachLayer(function (layer) {
    fare = layer.feature.properties[fareType];
    if (layer.feature.properties.code === stationCode) {
      layer.setStyle({
        radius: 7,
        color: "#000000",
        fillColor: "#000000",
        weight: 1
      }).bindTooltip("<center>Your Station<br>" + layer.feature.properties.name + "<br>" + "Fare: $" + fare.toFixed(2) + "</center>");
    } else {
      layer.setStyle({
        radius: 7,
        color: "#000000",
        fillColor: getColor(fare),
        weight: 1
      }).bindTooltip("<center>" + layer.feature.properties.name + "<br>" + "Fare: $" + fare.toFixed(2) + "</center>");
    }
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
  if (typeof updatedStations !== 'undefined') {
    map.removeLayer(updatedStations);
    stations.addTo(map);
  }

  color = document.getElementById("Line-selection").value

  if (color !== 'all') {
    SelectLine()
  }
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
  if (typeof updatedStations !== 'undefined') {
    map.removeLayer(updatedStations);
  }

  if (color === 'all') {
    lines.addTo(map);
    stations.addTo(map);
    map.fitBounds(lines.getBounds());
    document.getElementById("Fare-selection").selectedIndex = 0;
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
  selectedStationsLineUrl = '/line/' + color_code;
  const selectedStationsLineResp = fetch(selectedStationsLineUrl).then(response => response.json()).then(response => {
    selectedLine = L.geoJson(response, {
      style: function (features) {
        return {
          weight: 8,
          color: getLineColor(features.properties.name)
        }
      },
      pane: "metro"
    }).addTo(map);
  });

  // add stations, they have a onEachFeature function and a circle marker
  selectedStationsUrl = '/stations?line=' + color + '&geojson=true';
  const selectedStationsResp = fetch(selectedStationsUrl).then(response => response.json()).then(response => {
    selectedStations = L.geoJson(response, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 7,
          color: "#000000",
          fillColor: "#ffffff",
          fillOpacity: 1.0
        }).bindTooltip(feature.properties.name);
      },
      onEachFeature: onEachFeatureStationsOnLine,
      pane: "stations"
    }).addTo(map);
    map.fitBounds(selectedStations.getBounds());
  });

}
