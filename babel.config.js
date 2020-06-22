module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": ["ie >= 11"]
        }
      }
    ],
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties"
  ]
};