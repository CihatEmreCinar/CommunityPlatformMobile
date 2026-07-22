const appJson = require('./app.json');

const config = { ...appJson.expo };
const isLocalHttpDevelopment =
  process.env.APP_ENV !== 'production' && process.env.EXPO_PUBLIC_API_URL?.startsWith('http://');

if (isLocalHttpDevelopment) {
  config.plugins = [...(config.plugins ?? []), './plugins/withDevCleartextTraffic'];
}

module.exports = config;
