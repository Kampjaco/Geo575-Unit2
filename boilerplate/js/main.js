// Add all scripts to the JS folder

//Create the map
function createMap() {
    var map = L.map('map').setView([44.41154690517817, -89.63139921756608], 8);

    var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 19,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Get data for the map
    getData(map)
}


function calculatedMinValue(data) {
    //Create an empty array to store all data values
    var allValues = [];
    //Loop through each feature
    for(var i = 0; i < data.features.length; i++) {
        //Get current feature
        var feature = data.features[i];
        //Get longitude value of current feature
        var longitude = feature.geometry.coordinates[0];
        //Add value to array
        allValues.push(longitude);
    }
    //Get minimum value for array
    var minValue = Math.min(...allValues);

    return minValue;
}

//Calculate radius of each proportional symbol
function calcPropRadius(attValue) {
    //Constant factor adjusts symbol sizes evenly
    var minRadius = 15;
    //Flannery Appearance Compensation formula.  Changed the multiplyer to really show the changes in longitude, otherwise it was unnoticable
    var radius = 1.0083 * Math.pow(attValue/minValue,15.5715) * minRadius;

    return radius;
}

function pointToLayer(feature, latlng){
    if (!feature.geometry || !feature.geometry.coordinates) {
        console.error("Invalid feature geometry:", feature);
        return null;
    }

    // Create marker options
    var geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // Extract longitude safely
    var longValue = Number(feature.geometry.coordinates[0]);

    if (isNaN(longValue)) {
        console.warn("Invalid longitude value:", feature.geometry.coordinates);
        longValue = 1; // Default fallback value
    }

    // Set the marker radius based on longitude
    geojsonMarkerOptions.radius = calcPropRadius(longValue);

    // Create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    // Popup content
    var popupContent = `
        <p><b>Facility Name: </b>${feature.properties.FAC_NM}<br>
        <b>Facility ID: </b>${feature.properties.LOC_ID}<br>
        <b>Facility Type: </b>${feature.properties.FAC_TY}<br>
        <b>Facility Ownership: </b>${feature.properties.FAC_OWSP}<br>
        <b>Facility Use: </b>${feature.properties.FAC_USE}<br>
        <b>Transmission Region: </b>${feature.properties.TRANS_RGN}<br>
        <b>More information: </b><a href="${feature.properties.F5010URL}" target="_blank">Link</a></p>
    `;

    // Bind popup to circle marker
    layer.bindPopup(popupContent);

    return layer; // ✅ Ensure we return a valid layer
}

// Function to create symbols
function createPropSymbols(data, map){
    
    // Add the GeoJSON layer
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
}

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    fetch('data/WiscAirports.geojson')
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //Calculate minimum data value
            minValue = calculatedMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, map);
        })
};

document.addEventListener('DOMContentLoaded',createMap);

