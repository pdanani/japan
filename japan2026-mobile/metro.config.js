const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Allow Metro to follow symlinks into the shared data folder
const sharedDir = path.resolve(__dirname, '..', 'shared');
config.watchFolders = [sharedDir];

// Make sure Metro resolves node_modules from this project, not shared/
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
