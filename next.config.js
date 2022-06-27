const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const isProd = process.env.NODE_ENV === "production";

module.exports = withBundleAnalyzer({
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    if (isProd)
      config.optimization = {
        sideEffects: true,
        runtimeChunk: "single",
        minimize: true,
        minimizer: [],
        splitChunks: {
          chunks: "all",
          maxInitialRequests: Infinity,
          minSize: 200000,
          maxSize: 250000,
        },
      };

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/bingo/:path*",
        destination: "https://bingo.ebombo.io/bingo/:path*",
      },
      {
        source: "/en/bingo/:path*",
        destination: "https://bingo-red.ebombo.io/en/bingo/:path*",
      },
      {
        source: "/hanged/:path*",
        destination: "https://hanged.ebombo.io/hanged/:path*",
      },
      {
        source: "/en/hanged/:path*",
        destination: "https://hanged-red.ebombo.io/en/hanged/:path*",
      },
      {
        source: "/roulette/:path*",
        destination: "https://roulette.ebombo.io/roulette/:path*",
      },
      {
        source: "/en/roulette/:path*",
        destination: "https://roulette-red.ebombo.io/en/roulette/:path*",
      },
      {
        source: "/roulettequestions/:path*",
        destination: "https://roulette.ebombo.io/roulettequestions/:path*",
      },
      {
        source: "/en/roulettequestions/:path*",
        destination: "https://roulette-red.ebombo.io/en/roulettequestions/:path*",
      },
      {
        source: "/trivia/:path*",
        destination: "https://trivia.ebombo.io/trivia/:path*",
      },
      {
        source: "/en/trivia/:path*",
        destination: "https://trivia-red.ebombo.io/en/trivia/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:all*(jpg|jpeg|gif|png|svg|ico)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/:all*(eot|otf|ttf|ttc|woff|font.css)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/:all*(js|css|json)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
});
