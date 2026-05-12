import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'; // Add this line

mapboxgl.accessToken = 'pk.eyJ1Ijoicm9teXJhbXJha2h5YW5pIiwiYSI6ImNtcDMzd2lpZTA4MGkycm9vNWRjYmhkeGIifQ.2wK8hH7tNx-YUdRqK3z0Kw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.09415, 42.36027],
    zoom: 12,
});

// 1. Helper function to convert Lng/Lat to Pixel coordinates
function getCoords(station) {
  const point = new mapboxgl.LngLat(+station.Long, +station.Lat); // Note: Use Long and Lat from JSON
  const { x, y } = map.project(point);
  return { cx: x, cy: y };
}

map.on('load', () => {
    const bikeStyle = {
        'line-color': '#32D400',
        'line-width': 3,
        'line-opacity': 0.6
    };

    // BOSTON
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

    // CAMBRIDGE
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/RECREATION_BikeFacilities.geojson'
    });
    map.addLayer({
        id: 'cambridge-lanes',
        type: 'line',
        source: 'cambridge_route',
        paint: bikeStyle
    });

    console.log("Bike lanes loaded!");// 2. Select the SVG and fetch data
    const svg = d3.select('#map').select('svg');
    const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

    try {
        const jsonData = await d3.json(jsonurl);
        const stations = jsonData.data.stations;

        // 3. Append circles for each station
        const circles = svg.selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8);

        // 4. Function to update positions
        function updatePositions() {
            circles
                .attr('cx', d => getCoords(d).cx)
                .attr('cy', d => getCoords(d).cy);
        }

        // 5. Initialize positions and link to map events
        updatePositions();
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

    } catch (error) {
        console.error('Error loading Bluebikes data:', error);
    }


});