// src/map.js
// Map initialization and routing integration (uses Leaflet + Leaflet Routing Machine)
// Requires: leaflet, leaflet-routing-machine, Chart.js, src/elevation.js, src/shade.js

const DEFAULT_CENTER = [40.7128, -74.0060];
const DEFAULT_ZOOM = 15;

const map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Routing control (uses public OSRM demo server by default).
// For production / heavy usage self-host OSRM/Valhalla/GraphHopper or use an API key provider.
const routingControl = L.Routing.control({
  router: L.Routing.osrmv1({
    serviceUrl: 'https://router.project-osrm.org/route/v1' // demo; self-host for production
  }),
  fitSelectedRoute: true,
  showAlternatives: false,
  routeWhileDragging: true,
  createMarker: (i, wp, nWps) => {
    // simple markers that are draggable
    return L.marker(wp.latLng, { draggable: true });
  },
  lineOptions: {
    styles: [{ color: '#0066cc', opacity: 0.8, weight: 6 }]
  }
}).addTo(map);

// Keep simple click-to-set-start-end UX
let clickState = { firstSet: false };
map.on('click', (e) => {
  const waypoints = routingControl.getWaypoints().filter(wp => wp.latLng);
  if (!clickState.firstSet) {
    // set start
    routingControl.spliceWaypoints(0, 1, e.latlng);
    clickState.firstSet = true;
  } else {
    // set end (replace second waypoint)
    // if there are currently no second waypoints, push, else replace
    if (waypoints.length < 2) {
      routingControl.spliceWaypoints(waypoints.length, 0, e.latlng);
    } else {
      routingControl.spliceWaypoints(1, 1, e.latlng);
    }
    clickState.firstSet = false;
  }
});

// When routes are found, request elevation and optionally shade analysis
routingControl.on('routesfound', (e) => {
  const routes = e.routes;
  if (!routes || routes.length === 0) return;

  // Use the first route
  const route = routes[0];

  // Extract lat/lngs from route coordinates
  // route.coordinates is an array of LatLng-like arrays [lat, lng] or L.LatLng
  // In some versions it's route.coordinates as array of L.LatLng objects
  let coords = [];
  if (route.coordinates && route.coordinates.length) {
    coords = route.coordinates.map(c => {
      // if c is an object with lat/lng, normalize
      if (c.lat !== undefined && c.lng !== undefined) return [c.lat, c.lng];
      // if c is array [lat, lng]
      if (Array.isArray(c) && c.length >= 2) return [c[1] !== undefined && c[0] !== undefined ? c[0] : c[1], c[1]];
      // fallback (assume it's [lng, lat])
      return [c[1], c[0]];
    });
  } else if (route.coordinates === undefined && route.geometry) {
    // polyline encoded geometry — try to decode if available
    try {
      const decoded = L.Polyline.fromEncoded(route.geometry).getLatLngs();
      coords = decoded.map(p => [p.lat, p.lng]);
    } catch (err) {
      console.warn('Could not decode route geometry', err);
    }
  }

  if (coords.length === 0 && route.summary && route.waypoints) {
    // fallback: use waypoints
    coords = routingControl.getWaypoints().filter(wp => wp.latLng).map(wp => [wp.latLng.lat, wp.latLng.lng]);
  }

  if (coords.length > 0) {
    // Request elevation data and draw profile
    if (window.Elevation) {
      window.Elevation.fetchElevationForCoordinates(coords)
        .then(profile => {
          window.Elevation.drawElevationChart(profile, 'elevationCanvas');
          document.getElementById('elevationContainer').classList.remove('hidden');
        })
        .catch(err => {
          console.warn('Elevation fetch failed', err);
        });
    } else {
      console.warn('Elevation module not loaded.');
    }
  }

  // store the last route coordinates for shade simulation button
  routingControl._lastRouteCoords = coords;
});

// Shade simulation button
const shadeButton = document.getElementById('shadeButton');
shadeButton.addEventListener('click', () => {
  const coords = routingControl._lastRouteCoords;
  if (!coords || coords.length === 0) {
    alert('No route available. Create a route first (click start and end).');
    return;
  }

  if (window.ShadeSimulator) {
    // Example: pass route coords and a time (now)
    window.ShadeSimulator.simulateShadeForRoute(coords, { date: new Date() })
      .then(() => {
        console.log('Shade simulation completed.');
      })
      .catch(err => {
        console.warn('Shade simulation error', err);
        alert('Shade simulation failed. See console for details.');
      });
  } else {
    alert('Shade simulation not available. Please include a Leaflet shadow simulator plugin or enable the shade API.');
  }
});

// Expose map and routingControl for debugging/REPL
window.__map = map;
window.__routingControl = routingControl;