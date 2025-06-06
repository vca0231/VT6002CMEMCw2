// filepath: c:\Users\christse\ReactProjects\VT6002CEM\Lab08\babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ["module:react-native-dotenv", {
      "env": ["production", "development"],
      "moduleName": "@env",
      "path": ".env",
      "blocklist": null,
      "allowlist": null,
      "safe": false,
      "allowUndefined": true,
      "verbose": false
    }]
  ],
};