module.exports = function (api) {
  api.assertVersion(7);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
          },
        },
      ],
    ],
    plugins: [
      [
        "@babel/plugin-transform-react-jsx",
        {
          pragma: "Meact.createElement",
          pragmaFrag: "Meact.Fragment",
          throwIfNamespace: false,
        },
      ],
    ],
  };
};
