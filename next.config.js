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
    return [
      {
        source: "/bingo/:path*",
        destination: "https://bingo-red.ebombo.io/bingo/:path*",
      },
      {
        source: "/hanged/:path*",
        destination: "https://hanged-red.ebombo.io/hanged/:path*",
      },
    ];
  },
});
