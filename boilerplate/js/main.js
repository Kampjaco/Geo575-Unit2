// Add all scripts to the JS folder

//Create the map
function createMap() {
    var map = L.map('map').setView([46.00318583226062, -94.60267026275974], 7);

    var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 19,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Get data for the map
    getData(map)
}

//Calculate minimum values for proportional circles
function calculatedMinValue(data) {
    //Create an empty array to store all data values
   var allValues = [];

   //Loop through each city
   for(var i=0; i < data.features.length; i++) {
    var properties = data.features[i].properties;
    //Loop through each year
    for(var year = 2010; year <= 2019; year ++) {
        //Get population for current year
        var value = properties[String(year) + " Pop" ]; 
        //Add values to array
        allValues.push(value);
    }
   }
   //Get minimum value in array
   var minValue = Math.min(...allValues);

   return minValue;
}

//Calculate radius of each proportional symbol
function calcPropRadius(attValue) {
    //Constant factor adjusts symbol sizes evenly
    var minRadius = 3;
    console.log(minValue);
    //Flannery Appearance Compensation formula.  Changed the multiplyer to really show the changes in longitude, otherwise it was unnoticable
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;

    return radius;
}

function pointToLayer(feature, latlng){

    //Attribute to symbolize
    var attribute = "2010 Pop";

    // Create marker options
    var geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    // Set the marker radius based on longitude
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    // Create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    // Popup content
    var popupContent = `
        <p><b>County: </b>${feature.properties.CTY_NAME}<br>
        <b>2010 Population: </b>${feature.properties[attribute]}<br>
        </p>
    `;

    // Bind popup to circle marker
    layer.bindPopup(popupContent);

    return layer; // 
}

// Function to create symbols
function createPropSymbols(data, map){
    
    // Add the GeoJSON layer
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
}

//Create new sequence controls
function createSequenceControls() {
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 10;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //Step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');

    //Make the buttons images now
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/backward.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")
}

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    fetch('data/MN_County_Pop.geojson')
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //Calculate minimum data value
            minValue = calculatedMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, map);
            //Function for sequence control
            createSequenceControls();
        })
};

document.addEventListener('DOMContentLoaded',createMap);

