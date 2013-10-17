module.exports = {
  fromOsm: function(feature) {
    return feature;
  },
  toOsm: function(feature) {
    feature.properties.toOsm = true;

    return feature;
  }
};