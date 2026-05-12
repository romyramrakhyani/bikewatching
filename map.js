import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9teXJhbXJha2h5YW5pIiwiYSI6ImNtcDMzd2lpZTA4MGkycm9vNWRjYmhkeGIifQ.2wK8hH7tNx-YUdRqK3z0Kw';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div in your index.html
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom level
  minZoom: 5, // Minimum allowed zoom
  maxZoom: 18, // Maximum allowed zoom
});

map.on('load', () => {
    console.log('Map has successfully loaded!');
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });

    // 2. Add the Cambridge Source
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridge-gis-data/master/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    // 3. Define a shared style so we don't repeat code
    const bikeLaneStyle = {
        'line-color': '#32D400',  // A nice bright green
        'line-width': 3,
        'line-opacity': 0.6
    };

    // 4. Create the Boston Layer
    map.addLayer({
        id: 'boston-bike-lanes',
        type: 'line',
        source: 'boston_route',
        paint: bikeLaneStyle
    });

    // 5. Create the Cambridge Layer
    map.addLayer({
        id: 'cambridge-bike-lanes',
        type: 'line',
        source: 'cambridge_route',
        paint: bikeLaneStyle
    });
});