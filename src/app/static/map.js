//add basemap
      var map = L.map('mapid');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      
      //geojson files
      var station_url = "static/Metro_Stations.geojson";
      var line_url = "static/Metro_Lines.geojson";
      var fare_url = "static/all_stations.json";
      
      //formatting into json objects
      var stationjson = {};
      var linejson = {};
      var farejson = {};
      
      //getting station information
      $.ajax({
        url:station_url,
        async:false,
        dataType:'json',
        success: function(data){
          stationjson = data;
        }
      });
      
      //getting line infomation
      $.ajax({
        url:line_url,
        async:false,
        dataType:'json',
        success: function(data){
          linejson = data;
        }
      });
    
      //getting fare information
      $.ajax({
        url: fare_url,
        async: false,
        dataType: 'json',
        success: function(data) {
          farejson = data;
        }
      });
      
      //Get fare information for a station
      function GetFares(dept,arr,fareType){
        fareValue = farejson[dept][arr]["fares"][fareType];
        return parseFloat(fareValue);
      }
      
      //highlight station function
      function highlightFeature(e) {
        var target = e.target;
        stations.eachLayer(function(layer) {
          fare = GetFares(layer.feature.properties.STAT_NAME, target.feature.properties.STAT_NAME, document.getElementById("Fare-selection").value);
          layer.setStyle({
          fillColor: getColor(fare),
            radius: 5,
            weight: 1
          }).bindTooltip("<center>" + layer.feature.properties.STAT_NAME + "<br>" + "Fare: $" + fare.toFixed(2) + "</center>");
        }); 
      }
      
      function onEachFeature(feature, layer) {
        layer.on({
          click: highlightFeature
        });
      }
      
      function getColor(d) {
        fareType=document.getElementById("Fare-selection").value;
        switch(fareType) {
          case "peak":
            return d == 6.0 ? '#d73027' :
              d >= 5.0  ? '#fc8d59' :
              d >= 4.0  ? '#fee08b' :
              d >= 3.5  ? '#ffffbf' :
              d >= 3.0  ? '#d9ef8b' :
              d >= 2.5  ? '#91cf60' :
              d >= 2.0  ? '#1a9850' :
                         '#000000';
          case "offpeak":
            return d == 3.85 ? '#d7191c' :
              d >= 3.5  ? '#fdae61' :
              d >= 3.0  ? '#ffffbf' :
              d >= 2.5 ? '#a6d96a' :
              d >= 2  ? '#1a9641' :
                         '#000000';
          case "reduced_peak":
            return d == 3.00 ? '#d7191c' :
              d >= 2.5  ? '#fdae61' :
              d >= 2.0  ? '#ffffbf' :
              d >= 1.5 ? '#a6d96a' :
              d >= 1.0  ? '#1a9641' :
                         '#000000';
          default:
            return '#FFFFFF';
        }
      }
      
      //creating stations layer
      var stations = L.geoJson(stationjson, {
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 5,
            color: "#000000",
            fillColor: "#ffffff",
            fillOpacity: 1.0
          }).bindTooltip(feature.properties.STAT_NAME);
        },
        onEachFeature: onEachFeature
      });
      
      //creating lines layer
      var lines = L.geoJson(linejson, {
        style: function(features) {
          return {
            weight: 6,
            color: features.properties.NAME
          };
        }/*,
        onEachFeature: function(feature,layer){
          selection(feature, layer);
        }*/
      });
      
      //adding stations and lines to map
      stations.addTo(map);
      lines.addTo(map);
      lines.bringToBack();
      map.fitBounds(stations.getBounds());
      
