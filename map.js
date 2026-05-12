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
    const lon = station.Long || station.lon;
    const lat = station.Lat || station.lat;

    if (!lon || !lat) {
        return { cx: -10, cy: -10 };
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

    // Add Bike Lanes
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

    // Step 4: Loading Traffic and Stations
    try {
        const [stationsData, trips] = await Promise.all([
            d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json'),
            d3.csv('https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv')
        ]);

        let stations = stationsData.data.stations;

        // Step 4.2: Calculate traffic volumes
        const departures = d3.rollup(
            trips,
            (v) => v.length,
            (d) => d.start_station_id
        );

        const arrivals = d3.rollup(
            trips,
            (v) => v.length,
            (d) => d.end_station_id
        );

        stations = stations.map((station) => {
            let id = station.short_name;
            station.arrivals = arrivals.get(id) ?? 0;
            station.departures = departures.get(id) ?? 0;
            station.totalTraffic = station.arrivals + station.departures;
            return station;
        });

        // Step 4.3: Create Square Root Scale
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(stations, (d) => d.totalTraffic)])
            .range([0, 25]);

        const svg = d3.select('#map').select('svg');

        const circles = svg.selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', d => radiusScale(d.totalTraffic)) // Scale radius by traffic
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('opacity', 0.6) // Lower opacity for better overlap visibility
            .each(function (d) {
                // Step 4.4: Add tooltips
                d3.select(this)
                    .append('title')
                    .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
            });

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
        console.error('Error loading data:', error);
    }
});