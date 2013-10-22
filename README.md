# arc2osm

A Node.js task that queries ArcGIS Server feature and/or map services and synchronizes inserts, updates, and deletes with an OpenStreetMap database via the [OSM API](http://wiki.openstreetmap.org/wiki/API_v0.6).

The National Park Service uses this internally to synchronize our servicewide datasets (roads, trails, buildings, boundaries, etc.) with our OpenStreetMap render database.

This software is still a work-in-progress, and is very low tech right now. It will likely improve in the future. Some ideas on how it might be improved include:

- Switch to streams
- Hit ArcGIS Server via SOAP rather than REST
- Utilize the editor tracking feature introduced in ArcGIS Server 10.1

At this point, however, we are only synchronizing fairly small datasets (< 50,000 records) on an infrequent basis (once a day), so low tech works.

## Installation

1. Install Node.js
2. `git clone https://github.com/nationalparkservice/arc2osm`
3. `cd arc2osm`
4. `npm install`
5. Update config.json with information about the ArcGIS Server endpoints you want to ingest data from
6. `node app.js`
