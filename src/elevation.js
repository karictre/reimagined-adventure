// src/elevation.js
// Fetches elevation samples along a route and draws a small chart
// Dependencies: Chart.js must be loaded (index.html already includes it).
//
// Behavior:
// - Accepts an array of [lat, lng] coords
// - Downsamples to a reasonable number of points (maxSamples) to avoid API limits
// - Tries Open-Elevation public API, but will fallback gracefully
//
// Usage:
//   Elevation.fetchElevationForCoordinates(coords).then(profile => { Elevation.drawElevationChart(profile, 'elevationCanvas') })

const Elevation = (function () {
  const MAX_SAMPLES = 120; // limit; adjust for API limits
  const OPEN_ELEVATION_URL = 'https://api.open-elevation.com/api/v1/lookup';

  // utility: simple haversine distance (meters)
  function haversine(a, b) {
    const toRad = (d) => d * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const sinDlat = Math.sin(dLat / 2);
    const sinDlon = Math.sin(dLon / 2);
    const aa = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  }

  // sample a polyline to <= maxPoints evenly by distance
  function samplePolyline(coords, maxPoints = MAX_SAMPLES) {
    if (coords.length <= maxPoints) return coords.slice();

    // compute cumulative distances
    const segDistances = [];
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const d = haversine(coords[i - 1], coords[i]);
      segDistances.push(d);
      total += d;
    }

    const step = total / (maxPoints - 1);
    const sampled = [coords[0]];
    let currentDist = 0;
    let segIndex = 0;
    let segAccum = 0;

    for (let i = 1; i < coords.length && sampled.length < maxPoints; i++) {
      const prev = coords[i - 1];
      const cur = coords[i];
      const segLen = segDistances[i - 1] || 0;
      // while we can place a sample in this segment
      while (currentDist + segLen - segAccum >= step && sampled.length < maxPoints) {
        const remain = step - (currentDist - segAccum);
        const t = remain / segLen;
        // linear interpolation
        const lat = prev[0] + (cur[0] - prev[0]) * t;
        const lng = prev[1] + (cur[1] - prev[1]) * t;
        sampled.push([lat, lng]);
        currentDist += step;
      }
      segAccum += segLen;
    }

    if (sampled.length < maxPoints) sampled.push(coords[coords.length - 1]);
    return sampled;
  }

  async function fetchOpenElevation(coords) {
    // Build locations param: "lat,lng|lat,lng|..."
    const locations = coords.map(c => `${c[0]},${c[1]}`).join('|');
    const url = `${OPEN_ELEVATION_URL}?locations=${encodeURIComponent(locations)}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Open-Elevation HTTP ${resp.status}`);
    const json = await resp.json();
    // returns results array with {latitude, longitude, elevation}
    if (!json.results) throw new Error('Unexpected elevation response');
    return json.results.map(r => r.elevation);
  }

  async function fetchElevationForCoordinates(coords) {
    if (!coords || coords.length === 0) return Promise.reject('No coordinates provided');
    const sampled = samplePolyline(coords, MAX_SAMPLES);

    try {
      const elevations = await fetchOpenElevation(sampled);
      // build profile: distance (meters) and elevation (meters)
      const distances = [0];
      for (let i = 1; i < sampled.length; i++) {
        distances.push(distances[i - 1] + haversine(sampled[i - 1], sampled[i]));
      }
      return {
        points: sampled,
        distances,
        elevations
      };
    } catch (err) {
      // Fallback: return zero elevations (so UI won't crash). Caller should show message.
      console.warn('Open-Elevation failed:', err);
      const distances = [0];
      for (let i = 1; i < sampled.length; i++) {
        distances.push(distances[i - 1] + haversine(sampled[i - 1], sampled[i]));
      }
      return {
        points: sampled,
        distances,
        elevations: sampled.map(() => 0),
        fallback: true,
        error: err.message
      };
    }
  }

  // draw elevation chart using Chart.js in a canvasId element
  function drawElevationChart(profile, canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    // destroy previous chart if present
    if (window.__elevationChart) {
      try { window.__elevationChart.destroy(); } catch (e) { /* ignore */ }
    }

    const labels = profile.distances.map(d => (d / 1000).toFixed(2) + ' km');
    const data = {
      labels,
      datasets: [{
        label: 'Elevation (m)',
        data: profile.elevations,
        borderColor: '#ff7f0e',
        backgroundColor: 'rgba(255,127,14,0.15)',
        pointRadius: 0,
        fill: true,
        tension: 0.15
      }]
    };

    window.__elevationChart = new Chart(ctx, {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Meters'
            }
          }
        },
        elements: {
          line: { borderWidth: 2 }
        }
      }
    });
  }

  return {
    fetchElevationForCoordinates,
    drawElevationChart
  };
})();

window.Elevation = Elevation;