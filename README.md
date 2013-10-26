# arc2osm

A Node.js task that queries one or more ArcGIS Server feature services and synchronizes inserts, updates, and deletes with an OpenStreetMap database via the [Places of Interest API](https://github.com/nationalparkservice/poi-api).

The National Park Service uses this task internally to synchronize our servicewide datasets (roads, trails, buildings, boundaries, etc.) that are managed in the Esri stack with our OpenStreetMap render database.

This software is still a work-in-progress, and is very unsophisticated at the moment. It will likely improve in the future. Some ideas on how it might be improved include:

- Switch to streams
- Hit ArcGIS Server via SOAP rather than REST
- Utilize the editor tracking feature introduced in ArcGIS Server 10.1 to offload the synchronization logic

At this point, however, we are only synchronizing fairly small datasets (< 50,000 records) on an infrequent basis (once a day), so we don't need anything too fancy.

## Installation

1. Install Node.js
2. `git clone https://github.com/nationalparkservice/arc2osm.git`
3. `cd arc2osm`
4. `npm install`
5. Update config.json with information about the ArcGIS Server endpoints you want to ingest data from
6. `node app.js`
