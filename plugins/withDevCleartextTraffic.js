const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDevCleartextTraffic(config) {
  return withAndroidManifest(config, (mod) => {
    mod.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    return mod;
  });
};
