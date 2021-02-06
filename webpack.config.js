const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const webpack = require('webpack')

const resolve = (dir) => path.resolve(__dirname, dir)

const PATHS = {
  appPath: resolve('.'),
  appSrc: resolve('src'),
  appDist: resolve('dist'),
  appPublic: resolve('public'),
  appHtml: resolve('public/index.html'),
  publicUrlOrPath: './',
}

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false
  }

  try {
    require.resolve('react/jsx-runtime')
    return true
  } catch (e) {
    return false
  }
})()

module.exports = (env, argv) => {
  const isEnvDev = env.development
  const isEnvProd = env.production
  process.env.BABEL_ENV = isEnvDev ? 'development' : 'production'
  process.env.NODE_ENV = isEnvDev ? 'development' : 'production'

  // 暂时未能实现，先置为 false
  const shouldUseReactRefresh = isEnvDev && false

  const getStyleLoaders = (cssOptions = {}, preProcessor = []) => {
    const loaders = [
      isEnvDev && require.resolve('style-loader'),
      isEnvProd && {
        loader: MiniCssExtractPlugin.loader,
      },
      {
        loader: 'css-loader',
        options: {
          ...cssOptions,
          importLoaders: preProcessor ? 2 : 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            // Necessary for external CSS imports to work
            // https://github.com/facebook/create-react-app/issues/2677
            ident: 'postcss',
            plugins: [
              require('postcss-flexbugs-fixes'),
              postcssPresetEnv({
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              }),
            ],
            sourceMap: isEnvDev,
          },
        },
      },
    ].filter(Boolean)
    return loaders.concat(preProcessor)
  }

  return {
    // react refresh 修复 webpack-dev-server@3 的 bug
    // target: isEnvDev ? 'web' : 'browserslist',
    mode: isEnvDev ? 'development' : 'production',
    // prod 模式下，只要出错就停止编译
    bail: isEnvProd,
    // 默认配置，无需写
    // entry: './src/index.js',
    output: {
      // The build folder.
      path: isEnvProd ? PATHS.appDist : undefined,
      filename: 'static/js/[name].js',
      // 块名，公共块名(非入口)
      chunkFilename: 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[hash][ext][query]',
      // dev-server 的默认 publicPath 为 '/'
      // 确保 devServer.publicPath 始终以正斜杠开头和结尾。
      // 建议 devServer.publicPath 与 output.publicPath 相同
      publicPath: isEnvDev ? '/' : PATHS.publicUrlOrPath,
    },
    devtool: isEnvDev ? 'eval-cheap-source-map' : false,
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      alias: {
        '@': PATHS.appSrc,
      },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(gif|png|jpg|jpeg)$/i,
              // 导出一个资源的 data URI。之前通过使用 url-loader 实现
              // 小于 8kb 的文件，将会视为 inline 模块类型，否则会被视为 resource 模块类型
              type: 'asset',
              // parser: {
              //   dataUrlCondition: {
              //     maxSize: 8 * 1024, // 8kb
              //   },
              // },
            },
            {
              test: /\.svg$/,
              use: ['@svgr/webpack'],
            },
            {
              test: /\.css$/,
              exclude: /node_modules/,
              oneOf: [
                {
                  resourceQuery: /modules/,
                  use: getStyleLoaders({ modules: true }),
                },
                {
                  use: getStyleLoaders({}),
                },
              ],
            },
            {
              test: /\.less$/,
              exclude: /node_modules/,
              oneOf: [
                {
                  resourceQuery: /modules/,
                  use: getStyleLoaders({ modules: true }, [
                    {
                      loader: 'less-loader',
                      options: { lessOptions: { javascriptEnabled: true } },
                    },
                  ]),
                },
                {
                  use: getStyleLoaders({}, [
                    {
                      loader: 'less-loader',
                      options: { lessOptions: { javascriptEnabled: true } },
                    },
                  ]),
                },
              ],
            },
            {
              test: /.[tj]sx?$/,
              exclude: /node_modules/,
              use: [
                /**
                 * plugin 在 preset 之前运行。
                 * plugin 执行顺序是第一个到最后一个。
                 * preset 顺序相反（从最后到第一个）。
                 */
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    presets: [
                      [
                        require.resolve('babel-preset-react-app'),
                        {
                          runtime: hasJsxRuntime ? 'automatic' : 'classic',
                        },
                      ],
                    ],
                    plugins: [
                      // import 'index.less' 说明是全局样式
                      // import styles from 'index.less' 说明是 css module
                      '@umijs/babel-plugin-auto-css-modules',
                      ['@babel/plugin-proposal-decorators', { legacy: true }],
                      isEnvDev &&
                        shouldUseReactRefresh &&
                        require.resolve('react-refresh/babel'),
                    ].filter(Boolean),
                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                    // It enables caching results in ./node_modules/.cache/babel-loader/
                    // directory for faster rebuilds.
                    cacheDirectory: true,
                    // See #6846 for context on why cacheCompression is disabled
                    cacheCompression: false,
                    compact: isEnvProd,
                  },
                },
              ],
            },
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
              generator: {
                filename: 'static/media/[hash][ext][query]',
              },
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: isEnvProd,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
        }),
      ],
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      // Keep the runtime chunk separated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      // https://github.com/facebook/create-react-app/issues/5358
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`,
      },
    },
    plugins: [
      new ESLintPlugin(),
      new HtmlWebpackPlugin({ template: PATHS.appHtml }),
      isEnvDev && new CaseSensitivePathsPlugin(),
      isEnvDev && new webpack.HotModuleReplacementPlugin(),
      isEnvDev && shouldUseReactRefresh && new ReactRefreshWebpackPlugin(),
      isEnvProd &&
        new CleanWebpackPlugin({
          // verbose Write logs to console.
          verbose: false, //开启在控制台输出信息
        }),
      isEnvProd &&
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].css',
        }),
      isEnvProd &&
        new CompressionPlugin({
          test: /\.(js|css)$/i,
          algorithm: 'gzip',
          threshold: 10240, // Byte
        }),
      // new webpack.DllReferencePlugin({
      //   context: process.cwd(),
      //   manifest: require(resolve(
      //     './public/vendor/vendorReact-manifest.json',
      //   )),
      //   name: 'vendor/vendorReact.dll.js',
      //   scope: 'react',
      //   sourceType: 'commonjs2',
      // }),
    ].filter(Boolean),
    cache: isEnvDev && {
      type: 'filesystem',
      // cacheDirectory Base directory for the cache. Defaults to node_modules/.cache/webpack
    },
    devServer: {
      https: env.http,
      publicPath: '/', // 此路径下的打包文件可在浏览器中访问
      port: '3000',
      overlay: true, // 浏览器页面上显示错误
      open: true, // 自动打开浏览器
      stats: 'errors-only', //stats: "errors-only"表示只打印错误：
      historyApiFallback: false, // 404 会被替代为 index.html
      inline: true, // 内联模式，实时刷新
      hot: true, // 开启热更新
      hotOnly: true, // 启用热模块替换，而无需页面刷新作为构建失败时的回退
      compress: true, // gzip
      // proxy: {
      //   '/api': {
      //     target: 'https://example.com/',
      //     changeOrigin: true,
      //     pathRewrite: {},
      //   },
      // },
    },
  }
}
