// SPDX-License-Identifier: MIT
// Copyright (c) 2026 karictre

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

// Use a Plan so we can manipulate waypoints reliably
const plan = L.Routing.plan([], {
  createMarker: (i, wp) => {
    return L.marker(wp.latLng, { draggable: true });
  }
});

const routingControl = L.Routing.control({
  plan,
  router: L.Routing.osrmv1({
    serviceUrl: 'https://router.project-osrm.org/route/v1' // demo; self-host for production
  }),
  fitSelectedRoute: true,
  showAlternatives: false,
  routeWhileDragging: true,
  lineOptions: {
    styles: [{ color: '#0066cc', opacity: 0.8, weight: 6 }]
  }
}).addTo(map);

// Simple click-to-set-start-end UX using setWaypoints
let pendingStart = null;
map.on('click', (e) => {
  if (!pendingStart) {
    pendingStart = e.latlng;
    // visually indicate start (temporary marker)
    if (window.__tempStartMarker) window.__tempStartMarker.remove();
    window.__tempStartMarker = L.marker(e.latlng, { opacity: 0.8 }).addTo(map).bindPopup('Start (click to set destination)').openPopup();
  } else {
    const start = pendingStart;
    const end = e.latlng;
    // clear temp marker
    if (window.__tempStartMarker) { window.__tempStartMarker.remove(); window.__tempStartMarker = null; }
    pendingStart = null;

    // Set waypoints explicitly
    routingControl.setWaypoints([start, end]);
  }
});

// Helper: normalize many coordinate representations into [lat, lng]
function normalizeCoord(c) {
  // L.LatLng-like object
  if (c == null) return null;
  if (typeof c.lat === 'number' && typeof c.lng === 'number') return [c.lat, c.lng];
  // array: [lat, lng] or [lng, lat]
  if (Array.isArray(c) && c.length >= 2) {
    // Heuristic: if first element is between -90..90 and second between -180..180, treat [lat,lng]
    const a = c[0], b = c[1];
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [a, b]; // [lat, lng]
    // otherwise assume [lng, lat] -> swap
    return [b, a];
  }
  // Fallback: try to read as object with 0/1 indices
  if (typeof c[0] === 'number' && typeof c[1] === 'number') {
    return [c[0], c[1]];
  }
  return null;
}

// Extract an ordered array of [lat,lng] coords from the route object that LRM returns
function extractRouteCoords(route) {
  if (!route) return [];
  // Common: route.coordinates is an array of L.LatLng or arrays
  if (Array.isArray(route.coordinates) && route.coordinates.length > 0) {
    const out = [];
    for (const item of route.coordinates) {
      const n = normalizeCoord(item);
      if (n) out.push(n);
    }
    if (out.length > 0) return out;
  }

  // Some routers expose route.geometry as an object {coordinates: [[lng,lat], ...]}
  if (route.geometry && Array.isArray(route.geometry.coordinates)) {
    return route.geometry.coordinates.map(c => normalizeCoord(c));
  }

  // Fallback: use the routingControl waypoints
  const wps = routingControl.getWaypoints().filter(wp => wp.latLng).map(wp => [wp.latLng.lat, wp.latLng.lng]);
  return wps;
}

// When a route is found, request elevation and optionally shade analysis
routingControl.on('routesfound', (e) => {
  const routes = e.routes;
  if (!routes || routes.length === 0) return;
  const route = routes[0];

  const coords = extractRouteCoords(route);
  if (!coords || coords.length === 0) {
    console.warn('No coordinates extracted from route. Route object:', route);
    return;
  }

  // store for shade button
  routingControl._lastRouteCoords = coords;

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

// Expose map and routingControl for debugging
window.__map = map;
window.__routingControl = routingControl;