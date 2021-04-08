module.exports = process.env.CI
  ? {
      assetPrefix: "/justice40/",
      future: {
        webpack5: true,
      },
    }
  : {
      future: {
        webpack5: true,
      },
    };
