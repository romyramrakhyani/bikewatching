import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1Ijoicm9teXJhbXJha2h5YW5pIiwiYSI6ImNtcDMzd2lpZTA4MGkycm9vNWRjYmhkeGIifQ.2wK8hH7tNx-YUdRqK3z0Kw';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027],
  zoom: 12,
});

map.on('load', async () => {
  // Shared style object to save space
  const bikeStyle = {
    'line-color': '#32D400',
    'line-width': 3,
    'line-opacity': 0.6
  };

  // --- BOSTON ---
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
  });

  map.addLayer({
    id: 'boston-lanes',
    type: 'line',
    source: 'boston_route',
    paint: bikeStyle
  });

  // --- CAMBRIDGE ---
  map.addSource('cambridge_route', {
    type: 'geojson',
    // UPDATED LINK BELOW:
    data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/master/Recreation/RECREATION_BikeFacilities.geojson'
  });

  map.addLayer({
    id: 'cambridge-lanes',
    type: 'line',
    source: 'cambridge_route',
    paint: bikeStyle
  });

  console.log("Bike lanes loaded!");
});