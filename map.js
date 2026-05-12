// 1. Imports (Only ONCE)
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 2. Token & Initialization (Only ONCE)
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9teXJhbXJha2h5YW5pIiwiYSI6ImNtcDMzd2lpZTA4MGkycm9vNWRjYmhkeGIifQ.2wK8hH7tNx-YUdRqK3z0Kw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.09415, 42.36027],
    zoom: 12,
});

// 3. Helper Function (Calculates where dots go based on map position)
function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.Long, +station.Lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}

// 4. Load Event (Runs once the map is ready)
map.on('load', async () => {
    // Shared style for bike lanes
    const bikeStyle = {
        'line-color': '#32D400',
        'line-width': 3,
        'line-opacity': 0.6
    };

    // ADD BOSTON LANES
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });
    map.addLayer({ id: 'boston-lanes', type: 'line', source: 'boston_route', paint: bikeStyle });

    // ADD CAMBRIDGE LANES
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/RECREATION_BikeFacilities.geojson'
    });
    map.addLayer({ id: 'cambridge-lanes', type: 'line', source: 'cambridge_route', paint: bikeStyle });

    // ADD BIKE STATIONS via D3
    const svg = d3.select('#map').select('svg');
    const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

    try {
        const jsonData = await d3.json(jsonurl);
        const stations = jsonData.data.stations;

        const circles = svg.selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8);

        function updatePositions() {
            circles
                .attr('cx', d => getCoords(d).cx)
                .attr('cy', d => getCoords(d).cy);
        }

        // Run once to place dots initially
        updatePositions();

        // Re-run whenever the map moves to keep dots "glued" to the street
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

        console.log("Success! Lanes and Stations are visible.");
    } catch (error) {
        console.error('Error loading Bluebikes JSON:', error);
    }
});