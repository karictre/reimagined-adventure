# reimagined-adventure

A completely FOSS-compliant GPS/GIS/interative map service with a focus on pedestrian features.

## Project Vision
- 100% FOSS and open-data compatible
- Designed for pedestrians: safe, practical routes, sidewalk awareness
- Includes overlays/analysis for:
    - Shade (time-of-day, seasonal, urban environment, trees, etc.)
    - Altitude/elevation gain for route segments

## Tech
- [Leaflet.js](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
- APIs for routing (OSRM, GraphHopper, OpenRouteService, Valhalla)
- Shade analyzers (e.g. [leaflet-shadow-simulator](https://github.com/ted-piotrowski/leaflet-shadow-simulator), shade map services)
- Altitude/elevation (Open-Elevation, OSM overlays)

## How to Run
Just open `index.html` in your browser. You’ll see a map with foundation for pedestrian tools.

## Roadmap/TODO
- [ ] Interactive pedestrian route builder (click to set start/end)
- [ ] Add real routing API (prefer FOSS: OSRM, GraphHopper, etc)
- [ ] Integrate shade overlay (via shadow simulation plugin or API)
- [ ] Fetch/display elevation profile for routes
- [ ] UI for toggling overlays

## FOSS Compliance
All data/services should be open-source and compatible with commercial/free redistribution.

---

Contributions and issue reports are welcome!