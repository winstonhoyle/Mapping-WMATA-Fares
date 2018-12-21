      red = false;
      function Red() {
        if (!red) {
          map.removeLayer(lines);
          redline = L.geoJson(linejson, {
            style: function(feature) {
              return { color: feature.properties.NAME};
            },
            filter: function(feature) {
              if (feature.properties.NAME === "red") return true;
            }
          });
          redline.addTo(map);
          map.fitBounds(redline.getBounds());
          red = true;
        } else {
          map.removeLayer(redline);
          map.addLayer(lines);
          map.fitBounds(lines.getBounds());
          red = false;
        }
      }
      
      /**
       *TO DO: COMMENT
       *ADD STATIONS TO EACH BUTTON
       *FORMAT FARES
       *FARE SELECTION
       *FARE COLOR
       *FORMAT WEBSITE
       *HOST
       */
      orange = false;
      function Orange() {
        if (!orange) {
          map.removeLayer(lines);
          map.removeLayer(stations);
          
          orangeStations = L.geoJson(stationjson, {
            pointToLayer: function(feature, latlng) {
                  return L.circleMarker(latlng, {
                  radius: 5,
                  color: "#000000",
                  fillColor: "#ffffff",
                  fillOpacity: 1.0
                  }).bindTooltip(feature.properties.STAT_NAME);
            },
            filter: function(features) {
                  orangeStations = OnlyStations("orange");
                  if (orangeStations.includes(features.properties.STAT_NAME)) return true;
            }
         });
         orangeline = L.geoJson(linejson, {
            style: function(feature) {
                  return { color: feature.properties.NAME};
            },
            filter: function(feature) {
              if (feature.properties.NAME === "orange") return true;
            }
          });
          orangeline.addTo(map);
          orangeStations.addTo(map);
          map.fitBounds(orangeline.getBounds());
          orange = true;
        } else {
          map.removeLayer(orangeline);
          map.removeLayer(orangeStations);
          map.addLayer(lines);
          map.addLayer(stations);
          map.fitBounds(lines.getBounds());
          orange = false;
        }
        
        
      }
      
      silver = false;
      function Silver() {
        if (!silver) {
          map.removeLayer(lines);
          silverline = L.geoJson(linejson, {
            style: function(feature) {
              return { color: feature.properties.NAME};
            },
            filter: function(feature) {
              if (feature.properties.NAME === "silver") return true;
            }
          });
          silverline.addTo(map);
          map.fitBounds(silverline.getBounds());
          silver = true;
        } else {
          map.removeLayer(silverline);
          map.addLayer(lines);
          map.fitBounds(lines.getBounds());
          silver = false;
        }
      }
      
      
/**
 * fix this
 */
      yellow = false;
      function Yellow() {
        if (!yellow) {
          map.removeLayer(lines);
          yellowline = L.geoJson(linejson, {
            style: function(feature) {
              return { color: feature.properties.NAME};
            },
            filter: function(feature) {
              if (feature.properties.NAME === "yellow") return true;
            }
          });
          yellowline.addTo(map);
          map.fitBounds(yellowline.getBounds());
          yellow = true;
        } else {
          map.removeLayer(yellowline);
          map.addLayer(lines);
          map.fitBounds(lines.getBounds());
          yellow = false;
        }
      }
      
      blue = false;
      function Blue() {
        if (!blue) {
          map.removeLayer(lines);
          blueline = L.geoJson(linejson, {
            style: function(feature) {
              return { color: feature.properties.NAME};
            },
            filter: function(feature) {
              if (feature.properties.NAME === "blue") return true;
            }
          });
          blueline.addTo(map);
          map.fitBounds(blueline.getBounds());
          blue = true;
        } else {
          map.removeLayer(blueline);
          map.addLayer(lines);
          map.fitBounds(lines.getBounds());
          blue = false;
        }
      }
      
      green = false;
      function Green() {
        if (!green) {
          map.removeLayer(lines);
          greenline = L.geoJson(linejson, {
            style: function(feature) {
              return { color: feature.properties.NAME};
            },
            filter: function(feature) {
              if (feature.properties.NAME === "green") return true;
            }
          });
          greenline.addTo(map);
          map.fitBounds(greenline.getBounds());
          green = true;
        } else {
          map.removeLayer(greenline);
          map.addLayer(lines);
          map.fitBounds(lines.getBounds());
          green = false;
        }
      }
      