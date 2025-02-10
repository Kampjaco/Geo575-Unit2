// Add all scripts to the JS folder
var map = L.map('map').setView([44.41154690517817, -89.63139921756608], 8);

var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//Fetch GeoJson
fetch('data/WiscAirports.geojson')
    .then(response => response.json()) // Parse the JSON
    .then(data => {
        L.geoJSON(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>Facility Name: </b>' + feature.properties.FAC_NM + '<br>' +
                                '<b>Facillity ID: </b>' + feature.properties.LOC_ID + '<br>' +
                                '<b>Facility Type: </b>' + feature.properties.FAC_TY +'<br>' +
                                '<b>Facility Ownership: </b>' + feature.properties.FAC_OWSP + '<br>' +
                                '<b>Facility Use: </b>' + feature.properties.FAC_USE + '<br>' +
                                '<b>Transmission Region: </b>' + feature.properties.TRANS_RGN + '<br>' +
                                '<b>More information: </b>' + '<a href='+feature.properties.F5010URL+'>Link' );
            }
        }).addTo(map); // Add GeoJSON layer
    })

