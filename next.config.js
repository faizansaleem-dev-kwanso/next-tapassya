/** @type {import('next').NextConfig} */
require('dotenv').config()
const withSass = require("@zeit/next-sass");
const withLess = require("@zeit/next-less");
const withCSS = require("@zeit/next-css");
const withPlugins = require('next-compose-plugins');

const isProd = process.env.NODE_ENV === "production";

// fix: prevents error when .less files are required by node
if (typeof require !== "undefined") {
  require.extensions[".less"] = (file) => {};
}
// const nextConfig = {
//   env: {
//     BUCKET_FOR_TEAM_AVATARS: process.env.BUCKET_FOR_TEAM_AVATARS,
//     STRIPEPUBLISHABLEKEY: process.env.STRIPEPUBLISHABLEKEY,
//     URL_APP: process.env.URL_APP,
//     URL_API: process.env.URL_API,
//     DEVELOPMENT_URL_API: process.env.DEVELOPMENT_URL_API,
//     DEVELOPMENT_URL_APP: process.env.DEVELOPMENT_URL_APP,
//     CONTAINER_URL_API: process.env.CONTAINER_URL_API,
//     PRODUCTION_URL_API: process.env.PRODUCTION_URL_API,
//     PRODUCTION_URL_APP: process.env.PRODUCTION_URL_APP,
//     PORT: process.env.PORT,
//     PORT_API: process.env.PORT_API,
//     DOCKER_MODE: process.env.DOCKER_MODE,
//     SESSION_NAME: process.env.SESSION_NAME,
//     CANNY_APP_ID: process.env.CANNY_APP_ID,
//     CANNY_BOARD_TOKEN: process.env.CANNY_BOARD_TOKEN,
//     ZENDESK_CHAT_ACCOUNT_KEY: process.env.ZENDESK_CHAT_ACCOUNT_KEY,
//     OIDC_AUTH_NAME: process.env.OIDC_AUTH_NAME,
//   },
//   target: 'serverless',
//   redirects: async () => {
//     return [
//       {
//         source: '/team/:teamSlug/new-stack',
//         destination: '/team/:teamSlug/new-project',
//         permanent: true,
//       },
//       {
//         source: '/team/:teamSlug/stacks/:id',
//         destination: '/team/:teamSlug/projects/:id',
//         permanent: true,
//       },
//       {
//         source: '/team/:teamSlug/stacks',
//         destination: '/team/:teamSlug/projects',
//         permanent: true,
//       },
//     ]
//   },
// };

// const plugins = [
//   withCSS({
//     cssLoaderOptions: {
//       importLoaders: 1,
//       localIdentName: "[local]___[hash:base64:5]",
//     },
//     webpack: (config, { isServer }) => {
//       if (isServer) {
//         const antStyles = /(antd\/.*?\/style).*(?<![.]js)$/;
//         const origExternals = [...config.externals];
//         config.externals = [
//           (context, request, callback) => {
//             if (request.match(antStyles)) return callback();
//             if (typeof origExternals[0] === 'function') {
//               origExternals[0](context, request, callback);
//             } else {
//               callback();
//             }
//           },
//           ...(typeof origExternals[0] === 'function' ? [] : origExternals),
//         ];

//         config.module.rules.unshift({
//           test: antStyles,
//           use: 'null-loader',
//         });
//       }
//       return config;
//     },
//     ...withLess(
//       withSass({
//         lessLoaderOptions: {
//           javascriptEnabled: true,
//         },
//       })
//     ),
//     withSass,
//   })
// ]

// module.exports = withPlugins(plugins, nextConfig);

module.exports = withCSS({
  webpack5: false,
  env: {
    BUCKET_FOR_TEAM_AVATARS: process.env.BUCKET_FOR_TEAM_AVATARS,
    STRIPEPUBLISHABLEKEY: process.env.STRIPEPUBLISHABLEKEY,
    URL_APP: process.env.URL_APP,
    URL_API: process.env.URL_API,
    DEVELOPMENT_URL_API: process.env.DEVELOPMENT_URL_API,
    DEVELOPMENT_URL_APP: process.env.DEVELOPMENT_URL_APP,
    CONTAINER_URL_API: process.env.CONTAINER_URL_API,
    PRODUCTION_URL_API: process.env.PRODUCTION_URL_API,
    PRODUCTION_URL_APP: process.env.PRODUCTION_URL_APP,
    PORT: process.env.PORT,
    PORT_API: process.env.PORT_API,
    DOCKER_MODE: process.env.DOCKER_MODE,
    SESSION_NAME: process.env.SESSION_NAME,
    CANNY_APP_ID: process.env.CANNY_APP_ID,
    CANNY_BOARD_TOKEN: process.env.CANNY_BOARD_TOKEN,
    ZENDESK_CHAT_ACCOUNT_KEY: process.env.ZENDESK_CHAT_ACCOUNT_KEY,
    OIDC_AUTH_NAME: process.env.OIDC_AUTH_NAME,
  },
  target: 'serverless',
  redirects: async () => {
    return [
      {
        source: '/team/:teamSlug/new-stack',
        destination: '/team/:teamSlug/new-project',
        permanent: true,
      },
      {
        source: '/team/:teamSlug/stacks/:id',
        destination: '/team/:teamSlug/projects/:id',
        permanent: true,
      },
      {
        source: '/team/:teamSlug/stacks',
        destination: '/team/:teamSlug/projects',
        permanent: true,
      },
    ]
  },
  cssLoaderOptions: {
    importLoaders: 1,
    localIdentName: "[local]___[hash:base64:5]",
  },
  ...withLess(
    withSass({
      lessLoaderOptions: {
        javascriptEnabled: true,
      },
    })
  ),
  withSass,
});
