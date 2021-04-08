  
// Create Marker Color function. Got earthquakes with a magnitude of 4.5+ in the past 30 days.
function markerColor(mag) {

    if (mag < 1) {
        return "#1635D9";
    } else if (1 <= mag & mag < 2) {
        return "#13DECE";
    } else if (2 <= mag & mag < 3) {
        return "#12E510";
    } else if (3 <= mag & mag < 4) {
        return "#DCEB0C";
    } else {
        return "#F02908";
    };
}

// Create the createMap function
function createMap(earthquakes) {

    // Create two tile layer options that will be the background of our map
    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });
    
    var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });
    
    // Create a baseMaps object to hold the layers
    var baseMaps = {
        "Satellite Map": satelliteMap,
        "Dark Map": darkMap
    };
  
    // Create an overlayMaps object to hold the earthquakes layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };
  
    // Creating map, giving it the Satellite map and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [0, 0],
        zoom: 2,
        layers: [satelliteMap, earthquakes]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    var legend = L.control({position: 'bottomright'});
  
    // insert div with the class of "legend"
    legend.onAdd = () => {
        var div = L.DomUtil.create("div", "legend");        
        var magnitudes = [0, 1, 2, 3, 4];

        magnitudes.forEach(m => {
            var range = `${m} - ${m+1.00}`;
            if (m >= 5.00) {range = `${m}+`}
            var html = `<div class="legend-item">
                    <div style="height: 20px; width: 20px; background-color:${markerColor(m)}"> </div>
                    <div class=legend-text>Magnitude: <strong>${range}</strong></div>
                </div>`
            div.innerHTML += html
        });
        return div;
    };
    legend.addTo(myMap);
}
  
// Create Markers function
function createMarkers(response) {
  
    // Pull the "earthquakes" property off of the response
    var earthquakes = response.features;

    // Initialize an array to hold earthquake markers
    var earthquakeMarkers = []

    // Loop through the earthquake array
    for (var index = 0; index < earthquakes.length; index++) {
        var earthquake = earthquakes[index];

        // For each earthquake, create a marker and bind a popup with the earthquakes detail
        var marker = L.circleMarker([ earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0] ], {
                radius: earthquake.properties.mag * 2,
                fillColor: markerColor(earthquake.properties.mag),
                fillOpacity: 0.75,
                stroke: false
            }
            ).bindPopup("<h4>" + earthquake.properties.place + "</h4><hr><p>" + new Date (earthquake.properties.time) + "</p>" + "<p><b>Magnitude: " +  earthquake.properties.mag + "<b></p>");

        earthquakeMarkers.push(marker);
    }
    createMap(L.layerGroup(earthquakeMarkers));
  
}
  
  
// Perform an API call to USGS API to get earthquake data.Call createMarkers when complete.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", createMarkers);