// map.js
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.YOUR_ACTUAL_TOKEN_HERE';

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // ID of the div in index.html
  style: 'mapbox://styles/mapbox/streets-v12', // Basemap style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

console.log('Mapbox GL JS Loaded:', mapboxgl);