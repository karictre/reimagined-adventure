# Credits

This project aggregates and uses several open-source libraries and open-data services. Below are the primary components, their licenses, and useful links. This page is not legal advice — if you plan to redistribute derived data or run services in production, please review each project's license and the data provider terms (especially OpenStreetMap's ODbL).

## Libraries & Tools

- Leaflet — a lightweight, open-source JavaScript library for interactive maps. License: BSD-2-Clause.
  - https://leafletjs.com/ (https://github.com/Leaflet/Leaflet)

- Leaflet Routing Machine — routing UI for Leaflet. License: MIT.
  - https://www.liedman.net/leaflet-routing-machine/ (https://github.com/perliedman/leaflet-routing-machine)

- Chart.js — simple, flexible JavaScript charting for visualization (used for elevation profiles). License: MIT.
  - https://www.chartjs.org/ (https://github.com/chartjs/Chart.js)

- OSRM (Open Source Routing Machine) — demonstrates routing in this project using the public demo server. OSRM is open-source (BSD license) and recommended to self-host for production.
  - https://project-osrm.org/ (https://github.com/Project-OSRM/osrm-backend)

## Data & APIs

- OpenStreetMap — map data. License: Open Database License (ODbL). Note: ODbL has share-alike requirements for derived databases; review obligations if you produce and redistribute derived datasets.
  - https://www.openstreetmap.org/

- Open-Elevation — public elevation API (community service). Check project for license and reliability. Many deployments exist; consider self-hosting or alternative elevation data providers for production.
  - https://open-elevation.com/ (https://github.com/Jorl17/open-elevation)

## Shade Simulation / Plugins

- leaflet-shadow-simulator (and forks) — client-side tools that estimate shade/shadow on Leaflet layers. These are typically open-source but vary by fork — check licenses before bundling.
  - Example: https://github.com/ted-piotrowski/leaflet-shadow-simulator

- shademap.app — an external service example. Before integrating, verify its API terms and license—some services provide data under more restrictive terms.
  - https://shademap.app/

## Notes & Caveats

- OpenStreetMap data (ODbL) imposes share-alike obligations: if you create a derived database from OSM data and redistribute it, you must share it under the same license. Displaying OSM tiles (as in Leaflet) is generally fine, but storing and redistributing modified OSM datasets carries obligations.

- Public demo servers (OSRM demo, public Open-Elevation deployments) are intended for testing and have rate limits and availability constraints. For production use, self-host services or use a provider with an appropriate SLA/licensing model.

- Always confirm license compatibility for your specific use case (especially if combining ODbL data with code under different licenses). If in doubt consult legal counsel.

---

If you'd like, I can add a LICENSE file for this repository (suggesting an MIT or BSD license) and a CONTRIBUTING.md with guidelines for adding new FOSS integrations.