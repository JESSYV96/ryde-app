const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [/android\/(build|app\/build|\.gradle)\/.*/];

module.exports = config;
