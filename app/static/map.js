// Set basemap layers
var OSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	minZoom: 11,
	maxZoom: 15,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  minZoom: 11,
	maxZoom: 15,
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var Stadia_StamenTonerLite = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 11,
	maxZoom: 15,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

baseMaps = {
  "OSM": OSM,
  "Esri World Imagery": Esri_WorldImagery,
  "Stadia Alidade Smooth": Stadia_StamenTonerLite
}

var map = L.map('map', {
    center: [38.898303, -77.028099],
    minZoom: 11,
    maxZoom: 15,
    layers: [OpenStreetMap_Mapnik],
    zoomControl: false,
});

var layerControl = L.control.layers(baseMaps).addTo(map);
layerControl.setPosition("bottomright")

L.control.zoom({
  position: 'bottomleft'
}).addTo(map);

// Save station info
var target;

// Lines for later
var selectedLine;
var selectedStations;
var updatedStations;
var updatedStationsOnLine;

//legend
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  fareType = document.getElementById("Fare-selection").value;
  var fares = [];
  switch (fareType) {
    case "peak":
      fares = [6.0, 5.0, 4.0, 3.5, 3.0, 2.5, 2.0];
      colors = ['#d73027', '#fc8d59', '#fee08b', '#ffffbf', '#d9ef8b', '#91cf60', '#1a9850'];
      break;
    case "off_peak":
      fares = [3.85, 3.5, 3.0, 2.5, 2.0];
      colors = ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'];
      break;
    case "senior_disabled":
      fares = [3.0, 2.5, 2.0, 1.5, 1.0];
      colors = ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'];
      break;
    case "":
      div.innerHTML = "Please selection a station";
      return div;
  }
  labels = [];
  for (var i = 0; i < fares.length; i++) {
    item = '<i style="background:' + getColor(fares[i]) + ';"></i> $' + fares[i] + (fares[i - 1] ? ' &ndash; ' + (fares[i - 1] - 0.01).toFixed(2) : "");
    labels.push(item);
  }
  labels.push('<i style="background:#000000"></i> Your station');
  div.innerHTML = labels.join('<br>');
  return div;
};


async function getStationId(stationCode) {
  getStationUrl = '/station?code=' + stationCode;
  let getStationResponse = await fetch(getStationUrl);
  let data = await getStationResponse.json();
  return data;
}

//Get fare information for a station
async function UpdateStations(stationCode) {

  // Remove colored stations if it exists
  if (typeof updatedStations !== 'undefined') {
    map.removeLayer(updatedStations)
  }

  let stationId
  await getStationId(stationCode).then(data => {
    stationId = data.station_id
  });


  // Get all fares for that station
  getFaresUrl = '/fare/' + stationId + '?geojson=true';
  const stationsGeojsonUrlResponse = await fetch(getFaresUrl).then(response => response.json()).then(response => {
    updatedStations = L.geoJson(response, {
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
    map.removeLayer(stations);
  });

}

//highlight station function
async function highlightFeature(e) {

  // Get target station aka clicked station
  target = e.target;
  let stationCode = target.feature.properties.code

  // Get fare value so we can query
  fareType = document.getElementById("Fare-selection").value;

  // If drop down empty
  if (fareType == '') {
    return
  }

  // Remove old stations layer
  map.removeLayer(stations)

  // Create new station
  await UpdateStations(stationCode);
  updatedStations.eachLayer(function (layer) {

    fare = layer.feature.properties[fareType];

    if (layer.feature.properties.code === stationCode) {
      layer.setStyle({
        radius: 5,
        color: "#000000",
        fillColor: "#000000",
        weight: 1
      }).bindTooltip("<center>Your Station<br>" + layer.feature.properties.name + "<br>" + "Fare: $" + fare.toFixed(2) + "</center>");
    } else {
      layer.setStyle({
        radius: 5,
        color: "#000000",
        fillColor: getColor(fare),
        weight: 1
      }).bindTooltip("<center>" + layer.feature.properties.name + "<br>" + "Fare: $" + fare.toFixed(2) + "</center>");
    }

  });

  // Add legend
  map.addControl(legend);
}

function onEachFeature(feature, layer) {
  layer.on({
    click: highlightFeature
  });
}

function getColor(d) {
  fareType = document.getElementById("Fare-selection").value;
  switch (fareType) {
    case "peak":
      return d == 6.0 ? '#d73027' :
        d >= 5.0 ? '#fc8d59' :
          d >= 4.0 ? '#fee08b' :
            d >= 3.5 ? '#ffffbf' :
              d >= 3.0 ? '#d9ef8b' :
                d >= 2.5 ? '#91cf60' :
                  d >= 2.0 ? '#1a9850' :
                    '#000000';
    case "off_peak":
      return d == 3.85 ? '#d7191c' :
        d >= 3.5 ? '#fdae61' :
          d >= 3.0 ? '#ffffbf' :
            d >= 2.5 ? '#a6d96a' :
              d >= 2 ? '#1a9641' :
                '#000000';
    case "senior_disabled":
      return d == 3.00 ? '#d7191c' :
        d >= 2.5 ? '#fdae61' :
          d >= 2.0 ? '#ffffbf' :
            d >= 1.5 ? '#a6d96a' :
              d >= 1.0 ? '#1a9641' :
                '#000000';
    default:
      return '#FFFFFF';
  }
}

function getLineColor(color) {
  switch (color) {
    case "red":
      return '#BF0D3E'
    case "orange":
      return '#ED8B00'
    case "blue":
      return '#009CDE'
    case "green":
      return '#00B140'
    case "yellow":
      return '#FFD100'
    case "silver":
      return '#919D9D'
  }
}

map.createPane("metro");
map.createPane("stations");
map.getPane("stations").style.zIndex = 999;
map.getPane("metro").style.zIndex = 200;

// add lines geojson
lines_geojson_url = '/lines';
const lines_geojson_url_response = fetch(lines_geojson_url).then(response => response.json()).then(response => {
  lines = L.geoJson(response, {
    style: function (features) {
      return {
        weight: 6,
        color: getLineColor(features.properties.name)
      }
    },
    pane: "metro"
  }).addTo(map);
});

// add stations, they have a onEachFeature function and a circle marker
stations_geojson_url = '/stations?line=all&geojson=true';
const stations_geojson_url_response = fetch(stations_geojson_url).then(response => response.json()).then(response => {
  stations = L.geoJson(response, {
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
  map.fitBounds(stations.getBounds());
});
