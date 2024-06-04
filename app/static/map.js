//add basemap
var map = L.map('map', { scrollWheelZoom: true }).setView([38.898303, -77.028099], 11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 11,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

lines_geojson_url = 'http://127.0.0.1:8000/lines';
const lines_geojson_url_response = fetch(lines_geojson_url).then(response => response.json()).then(response => {
  lines = L.geoJson(response).addTo(map);
})

stations_geojson_url = 'http://127.0.0.1:8000/stations?geojson=true';
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
})


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
    case "offpeak":
      fares = [3.85, 3.5, 3.0, 2.5, 2.0];
      colors = ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'];
      break;
    case "reduced_peak":
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

//Get fare information for a station
function UpdateStations(station_code) {

  if (typeof updatedStations !== 'undefined') {
    map.removeLayer(updatedStations)
  }


  getStationUrl = 'http://127.0.0.1:8000/station?code=' + station_code

  // Get station code
  $.ajax({
    url: getStationUrl,
    async: false,
    dataType: 'json',
    success: function (data) {
      stationId = data.station_idx;
    }
  });

  // Get all fares for that station
  getFaresUrl = 'http://127.0.0.1:8000/fare/' + stationId + '?geojson=true'
  $.ajax({
    url: getFaresUrl,
    async: false,
    dataType: 'json',
    success: function (data) {
      stationGeoJSONdata = data
      updatedStations = L.geoJson(data, {
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
      map.removeLayer(stations)
    }
  });

}

//highlight station function
function highlightFeature(e) {
  var target = e.target;

  UpdateStations(target.feature.properties.code);
  updatedStations.eachLayer(function (layer) {
    fareType = document.getElementById("Fare-selection").value
    fare = layer.feature.properties[fareType]
    layer.setStyle({
      radius: 5,
      color: "#000000",
      fillColor: getColor(fare),
      weight: 1
    }).bindTooltip("<center>" + layer.feature.properties.name + "<br>" + "Fare: $" + fare.toFixed(2) + "</center>");

  });

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
    case "offpeak":
      return d == 3.85 ? '#d7191c' :
        d >= 3.5 ? '#fdae61' :
          d >= 3.0 ? '#ffffbf' :
            d >= 2.5 ? '#a6d96a' :
              d >= 2 ? '#1a9641' :
                '#000000';
    case "reduced_peak":
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

map.createPane("metro");
map.createPane("stations");
map.getPane("stations").style.zIndex = 999;
map.getPane("metro").style.zIndex = 200;
