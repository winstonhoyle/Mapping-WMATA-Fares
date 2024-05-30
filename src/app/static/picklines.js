      /* This javascript page is for the line selection
       * functions for line manipulation
       */
      
      /**
       * This function selects all the stations for the parameter of color
       */
      function OnlyStations(color){
      //empty list
        stationList = [];
      //for loop thay goes through all stations and retrieves the ones with the parameter of color
        for (var i=0; i < stationjson.features.length; i++){
          stationColor = stationjson.features[i].properties.MetroLine.split(",").map(function(item) {
            //remove spaces if a station has more than one color at the station
            return item.trim();
          });
          //pushes the station into the list if the station's line color matches the parameter
          if (stationColor.includes(String(color))){
            stationList.push(stationjson.features[i].properties.STAT_NAME);
          }
        }
        return stationList;
      }
      
      /**
       * Each of these functions that have a line color are the same
       * comments are only made to this first on
       */
      //defining false because color does not exist yet
      red = false;
      function Red() {
        if (!red) {
          //removing other lines and stations
          map.removeLayer(lines);
          map.removeLayer(stations);
          
          //creating a layer, the line color's stations
          redStations = L.geoJson(stationjson, {
            pointToLayer: function(feature, latlng) {
                  return L.circleMarker(latlng, {
                  radius: 5,
                  color: "#000000",
                  fillColor: "#ffffff",
                  fillOpacity: 1.0
                  }).bindTooltip(feature.properties.STAT_NAME);
            },
            filter: function(features) {
                  //calling the OnlyStation function to retrieve all stations that fall on the color's line
                  redStations = OnlyStations("red");
                  //return true if stations match
                  if (redStations.includes(features.properties.STAT_NAME)) return true;
            }
          });
          //creating a layer for the color's line
          redline = L.geoJson(linejson, {
            style: function(feature) {
              return {
                  weight: 6,
                  color: feature.properties.NAME
                  };
            },
            filter: function(feature) {
              if (feature.properties.NAME === "red") return true;
            }
          });
          //add both to map and zoom into the line
          redline.addTo(map);
          redStations.addTo(map);
          map.fitBounds(redline.getBounds());
          //color is now true because it exists
          red = true;
          //show user that that color has been selected
          document.getElementById("redButton").value = "Deselect Red";
        } else {
          //this else statement is here incase color already exists
          //the user now wants to remove the color's stations and line
          map.removeLayer(redline);
          map.removeLayer(redStations);
          //adds back all stations and lines
          map.addLayer(lines);
          map.addLayer(stations);
          map.fitBounds(lines.getBounds());
          //false because color's line and stations aren't on the map anymore
          red = false;
          //change button back to red
          document.getElementById("redButton").value = "Red";
        }
      }
      
      /**
       *TO DO: 
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
              return {
                  weight: 6,
                  color: feature.properties.NAME
                  };
            },
            filter: function(feature) {
              if (feature.properties.NAME === "orange") return true;
            }
          });
          orangeline.addTo(map);
          orangeStations.addTo(map);
          map.fitBounds(orangeline.getBounds());
          orange = true;
          document.getElementById("orangeButton").value = "Deselect Orange";
        } else {
          map.removeLayer(orangeline);
          map.removeLayer(orangeStations);
          map.addLayer(lines);
          map.addLayer(stations);
          map.fitBounds(lines.getBounds());
          orange = false;
          document.getElementById("orangeButton").value = "Orange";
        }
      }
      
      silver = false;
      function Silver() {
        if (!silver) {
          map.removeLayer(lines);
          map.removeLayer(stations);
          
          silverStations = L.geoJson(stationjson, {
            pointToLayer: function(feature, latlng) {
                  return L.circleMarker(latlng, {
                  radius: 5,
                  color: "#000000",
                  fillColor: "#ffffff",
                  fillOpacity: 1.0
                  }).bindTooltip(feature.properties.STAT_NAME);
            },
            filter: function(features) {
                  silverStations = OnlyStations("silver");
                  if (silverStations.includes(features.properties.STAT_NAME)) return true;
            }
          });
          silverline = L.geoJson(linejson, {
            style: function(feature) {
              return {
                  weight: 6,
                  color: feature.properties.NAME
                  };
            },
            filter: function(feature) {
              if (feature.properties.NAME === "silver") return true;
            }
          });
          silverline.addTo(map);
          silverStations.addTo(map);
          map.fitBounds(silverline.getBounds());
          silver = true;
          document.getElementById("silverButton").value = "Deselect Silver";
        } else {
          map.removeLayer(silverline);
          map.removeLayer(silverStations);
          map.addLayer(lines);
          map.addLayer(stations);
          map.fitBounds(lines.getBounds());
          silver = false;
          document.getElementById("silverButton").value = "Silver";
        }
      }
      
      
/**
 * fix this
 */
      yellow = false;
      function Yellow() {
        if (!yellow) {
          map.removeLayer(lines);
          map.removeLayer(stations);
          
          yellowStations = L.geoJson(stationjson, {
            pointToLayer: function(feature, latlng) {
                  return L.circleMarker(latlng, {
                  radius: 5,
                  color: "#000000",
                  fillColor: "#ffffff",
                  fillOpacity: 1.0
                  }).bindTooltip(feature.properties.STAT_NAME);
            },
            filter: function(features) {
                  yellowStations = OnlyStations("yellow");
                  if (yellowStations.includes(features.properties.STAT_NAME)) return true;
            }
          });
          yellowline = L.geoJson(linejson, {
            style: function(feature) {
              return {
                  weight: 6,
                  color: feature.properties.NAME
                  };
            },
            filter: function(feature) {
              if (feature.properties.NAME === "yellow") return true;
            }
          });
          yellowline.addTo(map);
          yellowStations.addTo(map);
          map.fitBounds(yellowline.getBounds());
          yellow = true;
          document.getElementById("yellowButton").value = "Deselect Yellow";
        } else {
          map.removeLayer(yellowline);
          map.removeLayer(yellowStations);
          map.addLayer(lines);
          map.addLayer(stations);
          map.fitBounds(lines.getBounds());
          yellow = false;
          document.getElementById("yellowButton").value = "Yellow";
        }
      }
      
      blue = false;
      function Blue() {
        if (!blue) {
          map.removeLayer(lines);
          map.removeLayer(stations);
          
          blueStations = L.geoJson(stationjson, {
            pointToLayer: function(feature, latlng) {
                  return L.circleMarker(latlng, {
                  radius: 5,
                  color: "#000000",
                  fillColor: "#ffffff",
                  fillOpacity: 1.0
                  }).bindTooltip(feature.properties.STAT_NAME);
            },
            filter: function(features) {
                  blueStations = OnlyStations("blue");
                  if (blueStations.includes(features.properties.STAT_NAME)) return true;
            }
          });
          blueline = L.geoJson(linejson, {
            style: function(feature) {
              return {
                  weight: 6,
                  color: feature.properties.NAME
                  };
            },
            filter: function(feature) {
              if (feature.properties.NAME === "blue") return true;
            }
          });
          blueline.addTo(map);
          blueStations.addTo(map);
          map.fitBounds(blueline.getBounds());
          blue = true;
          document.getElementById("blueButton").value = "Deselect Blue";
        } else {
          map.removeLayer(blueline);
          map.removeLayer(blueStations);
          map.addLayer(lines);
          map.addLayer(stations);
          map.fitBounds(lines.getBounds());
          blue = false;
          document.getElementById("blueButton").value = "Blue";
        }
      }
      
      green = false;
      function Green() {
        if (!green) {
          map.removeLayer(lines);
          map.removeLayer(stations);
          
          greenStations = L.geoJson(stationjson, {
            pointToLayer: function(feature, latlng) {
                  return L.circleMarker(latlng, {
                  radius: 5,
                  color: "#000000",
                  fillColor: "#ffffff",
                  fillOpacity: 1.0
                  }).bindTooltip(feature.properties.STAT_NAME);
            },
            filter: function(features) {
                  greenStations = OnlyStations("green");
                  if (greenStations.includes(features.properties.STAT_NAME)) return true;
            }
          });
          greenline = L.geoJson(linejson, {
            style: function(feature) {
              return {
                  weight: 6,
                  color: feature.properties.NAME
                  };
            },
            filter: function(feature) {
              if (feature.properties.NAME === "green") return true;
            }
          });
          greenline.addTo(map);
          greenStations.addTo(map);
          map.fitBounds(greenline.getBounds());
          green = true;
          document.getElementById("greenButton").value = "Deselect Green";
        } else {
          map.removeLayer(greenline);
          map.removeLayer(greenStations);
          map.addLayer(lines);
          map.addLayer(stations);
          map.fitBounds(lines.getBounds());
          green = false;
          document.getElementById("greenButton").value = "Green";
        }
      }
      