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
      
      
      orange = false;
      function Orange() {
        if (!orange) {
          map.removeLayer(lines);
          orangeline = L.geoJson(linejson, {
            style: function(feature) {
              return { color: feature.properties.NAME };
            },
            filter: function(feature) {
              if (feature.properties.NAME === "orange") return true;
            }
          });
          orangeline.addTo(map);
          map.fitBounds(orangeline.getBounds());
          orange = true;
        } else {
          map.removeLayer(orangeline);
          map.addLayer(lines);
          map.fitBounds(lines.getBounds());
          orange = false;
        }
      }