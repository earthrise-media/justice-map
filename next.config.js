module.exports = process.env.CI
  ? {
      assetPrefix: "/justice-map/",
      future: {
        webpack5: true,
      },
    }
  : {
      future: {
        webpack5: true,
      },
    };
