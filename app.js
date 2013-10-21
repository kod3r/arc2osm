/* http://esri.github.io/geojson-utils */
function esriConverter(){function l(b){var a,c,d,h;if(b){a={};if(b.x)a.type="Point",c=[b.x,b.y];else if(b.points)a.type="MultiPoint",c=b.points;else if(b.paths)c=b.paths,1===c.length?(a.type="LineString",c=c[0]):a.type="MultiLineString";else if(b.rings){c=b.rings;d=[];for(b=0;b<c.length;b++){var e=h=c[b],f=0,g=0,l=e.length,k=e[g],m=void 0;for(g;g<l-1;g++)m=e[g+1],f+=(m[0]-k[0])*(m[1]+k[1]),k=m;0<=f?d.push([h]):d[d.length-1].push(h)}1<d.length?(c=d,a.type="MultiPolygon"):(c=d.pop(),a.type="Polygon")}a.coordinates=c}return a}function k(b){var a=null,c,d;if(b&&(a={type:"Feature"},b.geometry&&(a.geometry=l(b.geometry)),b.attributes)){d={};for(c in b.attributes)d[c]=b.attributes[c];a.properties=d}return a}return{toGeoJson:function(b){var a,c,d;if(b)if(b.features)for(a={type:"FeatureCollection",features:[]},c=b.features,b=0;b<c.length;b++)(d=k(c[b]))&&a.features.push(d);else a=b.geometry?k(b):l(b);return a}}}function geoJsonConverter(){function l(a){var c,d;if("Point"===a)c="esriGeometryPoint";else if("MultiPoint"===a)c="esriGeometryMultipoint",d="points";else if("LineString"===a||"MultiLineString"===a)c="esriGeometryPolyline",d="paths";else if("Polygon"===a||"MultiPolygon"===a)c="esriGeometryPolygon",d="rings";return{type:c,geomHolder:d}}function k(a){var c,d,b,e,f;if("GeometryCollection"===a.type)for(d=[a.geometries.shift()],c=l(d[0].type),b=0;b<a.geometries.length;b++){e=c.type;f=a.geometries[b].type;var g=!1;"esriGeometryPoint"!==e&&"esriGeometryMultipoint"!==e||"Point"!==f&&"MultiPoint"!==f?"esriGeometryPolyline"!==e||"LineString"!==f&&"MultiLineString"!==f?"esriGeometryPolygon"!==e||"Polygon"!==f&&"MultiPolygon"!==f||(g=!0):g=!0:g=!0;g&&d.push(a.geometries[b])}else c=l(a.type),d=[a];"esriGeometryPoint"===c.type&&1<d.length&&(c=l("MultiPoint"));a={type:c.type,spatialReference:{wkid:4326}};if("esriGeometryPoint"===c.type)0===d[0].coordinates.length?(a.x=null,a.y=null):(a.x=d[0].coordinates[0],a.y=d[0].coordinates[1]);else for(a[c.geomHolder]=[],b=0;b<d.length;b++){e=d[b];g=f=void 0;if("MultiPoint"===e.type||"MultiLineString"===e.type||"Polygon"===e.type)g=e.coordinates;else if("Point"===e.type||"LineString"===e.type)g=[e.coordinates];else if("MultiPolygon"===e.type)for(g=[],f=0;f<e.coordinates.length;f++)g.push(e.coordinates[f]);f=g;for(e=0;e<f.length;e++)a[c.geomHolder].push(f[e])}return a}function b(a){var c,b,h;if(a&&(c={},a.geometry&&(c.geometry=k(a.geometry)),a.properties)){h={};for(b in a.properties)h[b]=a.properties[b];c.attributes=h}return c}return{toEsri:function(a){var c,d,h;if(a)if("FeatureCollection"===a.type)for(c={features:[]},d=a.features,a=0;a<d.length;a++)(h=b(d[a]))&&c.features.push(h);else c="Feature"===a.type?b(a):k(a);return c}}};

var completed = 0,
    config = require('./config.json'),
    converter = esriConverter(),
    count = config.arcGisServer.length,
    interval,
    request = require('request'),
    status = require('./status.json');

function handleResponse(error, response, callback) {
  if (!error && response.statusCode === 200) {
    callback(response);
  } else {
    console.log(response.statusCode + ': ' + error);
  }
}
function queryPaged(max, objectIds, url, callback) {
  var data = [],
      ids;

  console.log(objectIds.length);

  if (objectIds.length >= max) {
    ids = objectIds.slice(0, max);
  } else {
    ids = objectIds;
  }

  request(url + '&objectIds=' + ids.join(',') + '&outFields=*', function(error, response) {
    handleResponse(error, response, function(response) {
      data.push(JSON.parse(response.body));

      if (objectIds.length >= max) {
        objectIds.splice(0, max);
        queryPaged(max, objectIds, url, callback);
      } else {
        callback(data);
      }
    });
  });
}

for (var i = 0; i < count; i++) {
  (function() {
    var arcGisServer = config.arcGisServer[i];

    console.log(arcGisServer.url + '/query?f=json&where=' + (arcGisServer.query ? arcGisServer.query : 'OBJECTID IS NOT NULL') + '&returnIdsOnly=true');
    request(arcGisServer.url + '/query?f=json&where=' + (arcGisServer.query ? arcGisServer.query : 'OBJECTID IS NOT NULL') + '&returnIdsOnly=true', function(error, response) {
      handleResponse(error, response, function(response) {
        var objectIds = JSON.parse(response.body).objectIds;

        if (objectIds) {
          request(arcGisServer.url + '?f=json', function(error, response) {
            handleResponse(error, response, function(response) {
              //var max = JSON.parse(response.body).maxRecordCount;

              queryPaged(500, objectIds, arcGisServer.url + '/query?f=json', function(data) {
                //console.log(data);
                completed++;
              });
            });
          });
        } else {
          completed++;
        }
      });
    });
  })();
}

interval = setInterval(function() {
  if (completed === count) {
    clearInterval(interval);
    console.log('done');
  }
}, 1000);