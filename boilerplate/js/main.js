// Add all scripts to the JS folder
var map = L.map('map').setView([44.41154690517817, -89.63139921756608], 8);

var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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

    console.log(minValue);
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

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data){
    //Step 4: Determine attribute to symbolize with proportional symbols.  Since I don't have any numerical attributes in my data I am using the longitude value
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup('<b>Facility Name: </b>' + feature.properties.FAC_NM + '<br>' +
                            '<b>Facillity ID: </b>' + feature.properties.LOC_ID + '<br>' +
                            '<b>Facility Type: </b>' + feature.properties.FAC_TY +'<br>' +
                            '<b>Facility Ownership: </b>' + feature.properties.FAC_OWSP + '<br>' +
                            '<b>Facility Use: </b>' + feature.properties.FAC_USE + '<br>' +
                            '<b>Transmission Region: </b>' + feature.properties.TRANS_RGN + '<br>' +
                            '<b>More information: </b>' + '<a href='+feature.properties.F5010URL+'>Link' );
        },
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.geometry.coordinates[0]);

            //Step 6: Give each feature's circle marker a radius based on its longitude value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            return L.circleMarker(latlng, geojsonMarkerOptions);
        }

    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch('data/WiscAirports.geojson')
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //Calculate minimum data value
            minValue = calculatedMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })
};

document.addEventListener('DOMContentLoaded',getData);

