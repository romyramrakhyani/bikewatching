// 1. ALL IMPORTS AT THE TOP (Only once!)
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 2. TOKEN & INITIALIZATION (Only once!)
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9teXJhbXJha2h5YW5pIiwiYSI6ImNtcDMzd2lpZTA4MGkycm9vNWRjYmhkeGIifQ.2wK8hH7tNx-YUdRqK3z0Kw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.09415, 42.36027],
    zoom: 12,
});

// 3. HELPER FUNCTION (Outside the load event)
function getCoords(station) {
    // Note: Use 'Long' and 'Lat' to match the Bluebikes JSON properties
    const point = new mapboxgl.LngLat(+station.Long, +station.Lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}

// 4. THE LOAD EVENT (Everything that needs the map ready goes in here)
map.on('load', async () => {
    const bikeStyle = {
        'line-color': '#32D400',
        'line-width': 3,
        'line-opacity': 0.6
    };

    // ADD BIKE LANES (Boston & Cambridge)
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });
    map.addLayer({ id: 'boston-lanes', type: 'line', source: 'boston_route', paint: bikeStyle });

    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/RECREATION_BikeFacilities.geojson'
    });
    map.addLayer({ id: 'cambridge-lanes', type: 'line', source: 'cambridge_route', paint: bikeStyle });

    // ADD BIKE STATIONS (D3)
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

        // Initial draw
        updatePositions();

        // Listen for map changes to keep dots in place
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

        console.log("Map, Lanes, and Stations loaded successfully!");
    } catch (error) {
        console.error('Error loading data:', error);
    }
});