# reimagined-adventure

A completely FOSS-compliant GPS/GIS/interactive map service with a focus on pedestrian features.

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
Just open `index.html` in your browser or use the GitHub Pages site at:

https://karictre.github.io/reimagined-adventure/

You’ll see a map with foundation for pedestrian tools.

## License
This repository's code is released under the MIT License. See the `LICENSE` file for details.

Note on data and external services:
- OpenStreetMap data used by this project is licensed under the Open Database License (ODbL). If you create and redistribute derived OSM databases, you must comply with ODbL share‑alike requirements and provide attribution.
- External services used for demo (router.project-osrm.org, api.open-elevation.com) are public demo endpoints and may have rate limits or additional terms. For production consider self-hosting or using a provider with appropriate terms.

## Roadmap/TODO
- [ ] Interactive pedestrian route builder (click to set start/end)
- [ ] Add real routing API (prefer FOSS: OSRM, GraphHopper, etc)
- [ ] Integrate shade overlay (via shadow simulation plugin or API)
- [ ] Fetch/display elevation profile for routes
- [ ] UI for toggling overlays

## Contributing
See CONTRIBUTING.md for contribution guidelines, code style, and licensing expectations.

---