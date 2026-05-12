import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1Ijoicm9teXJhbXJha2h5YW5pIiwiYSI6ImNtcDMzd2lpZTA4MGkycm9vNWRjYmhkeGIifQ.2wK8hH7tNx-YUdRqK3z0Kw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.09415, 42.36027],
    zoom: 12,
});

function getCoords(station) {
    // Check for Long/Lat (capitalized) OR lon/lat (lowercase)
    const lon = station.Long || station.lon;
    const lat = station.Lat || station.lat;

    // Ensure we actually have numbers before giving them to Mapbox
    if (!lon || !lat) {
        return { cx: -10, cy: -10 }; // Hide off-screen if data is missing
    }

    const point = new mapboxgl.LngLat(+lon, +lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}

map.on('load', async () => {
    const bikeStyle = {
        'line-color': '#32D400',
        'line-width': 3,
        'line-opacity': 0.6
    };

    // Add Boston Lanes
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });
    map.addLayer({ id: 'boston-lanes', type: 'line', source: 'boston_route', paint: bikeStyle });

    // Add Cambridge Lanes
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/RECREATION_BikeFacilities.geojson'
    });
    map.addLayer({ id: 'cambridge-lanes', type: 'line', source: 'cambridge_route', paint: bikeStyle });

    // Add Bluebikes Stations
    try {
    const stationsData = await d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json');
    console.log('First station check:', stationsData.data.stations[0]); // Check names here!
    
    const stations = stationsData.data.stations;
        const svg = d3.select('#map').select('svg');

        const circles = svg.selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', 5)               // Radius
            .attr('fill', '#007bff')    // Bright Blue
            .attr('stroke', 'white')    // White border
            .attr('stroke-width', 1)
            .attr('opacity', 1);        // Full opacity to start

        function updatePositions() {
            circles
                .attr('cx', d => getCoords(d).cx)
                .attr('cy', d => getCoords(d).cy);
        }

        updatePositions();
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

    } catch (error) {
        console.error('Error loading stations:', error);
    }
});