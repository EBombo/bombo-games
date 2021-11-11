const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  future: {
    webpack5: true,
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    return config;
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/bingo/:path*",
          destination: "https://bingo-red.ebombo.io/:path*",
        },
      ],
    };
  },
});
