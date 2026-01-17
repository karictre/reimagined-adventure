// src/shade.js
// Shade simulation shim / adapter
// This module is intentionally small and defensive: it will try to use any available in-page
// Leaflet shadow simulator plugin (if you add one) or call out to a shade API if configured.
//
// Expected usage:
//   ShadeSimulator.simulateShadeForRoute(coords, { date: new Date() })
// Returns a Promise that resolves when done (or rejects on error).

const ShadeSimulator = (function () {
  async function simulateShadeForRoute(coords, opts = {}) {
    // coords: array of [lat, lng]
    // opts: { date: Date, pluginOptions: {...}, apiUrl: 'https://...' }

    // 1) If a client-side plugin is present (developer can include a plugin script), use it
    if (window.LeafletShadowSimulator || window.L && window.L.ShadowSimulator) {
      // Example integration contract - adapt to whichever plugin you install.
      try {
        const plugin = window.LeafletShadowSimulator || window.L.ShadowSimulator;
        if (typeof plugin.simulate === 'function') {
          await plugin.simulate(coords, opts);
          return;
        }
        // If plugin exposes a constructor:
        if (typeof plugin === 'function') {
          const layer = plugin(coords, opts);
          if (layer && layer.addTo) layer.addTo(window.__map || map);
          return;
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // 2) If an external shade API is configured, call it.
    if (opts.apiUrl) {
      try {
        // Example POST body; adjust to API spec
        const resp = await fetch(opts.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: coords, date: opts.date ? opts.date.toISOString() : undefined })
        });
        if (!resp.ok) throw new Error(`Shade API HTTP ${resp.status}`);
        const result = await resp.json();
        // result should include polygons or a raster tile url to overlay
        if (result.overlayGeoJson) {
          const layer = L.geoJSON(result.overlayGeoJson, { style: { color: '#222', opacity: 0.6 } });
          layer.addTo(window.__map);
        }
        return result;
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // 3) Fallback: no plugin or API available
    return Promise.reject(new Error('No shade simulator plugin or API configured. Install leaflet-shadow-simulator or provide opts.apiUrl.'));
  }

  return { simulateShadeForRoute };
})();

window.ShadeSimulator = ShadeSimulator;