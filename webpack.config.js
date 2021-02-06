const path = require('path')
// const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const webpack = require('webpack')

const PATHS = {
  src: path.join(__dirname, 'src'),
}

const resolve = (dir) => path.resolve(__dirname, dir)

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

  return {
    // 修复 webpack-dev-server@3 的 bug
    // target: isEnvDev ? 'web' : 'browserslist',
    mode: isEnvDev ? 'development' : 'production',
    // prod 模式下，只要出错就停止编译
    bail: isEnvProd,
    // 默认配置，无需写
    // entry: './src/index.js',
    output: {
      // The build folder.
      path: isEnvProd ? resolve('dist') : undefined,
      // Add /* filename */ comments to generated require()s in the output.
      // pathinfo: isEnvDev,
      // // There will be one main bundle, and one file per asynchronous chunk.
      // // In development, it does not produce real files.
      filename: 'static/js/[name].js',
      // 块名，公共块名(非入口)
      chunkFilename: 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[hash][ext][query]',
      // 路径需要以 '/' 结束，否则文件资源无法获取到正确路径
      publicPath: './',
    },
    devtool: isEnvDev ? 'eval-cheap-source-map' : false,
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      alias: {
        '@': resolve('src'),
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
                  use: [
                    isEnvDev && require.resolve('style-loader'),
                    isEnvProd && {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    { loader: 'css-loader', options: { modules: true } },
                  ].filter(Boolean),
                },
                {
                  use: [
                    isEnvDev && require.resolve('style-loader'),
                    isEnvProd && {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    { loader: 'css-loader' },
                  ].filter(Boolean),
                },
              ],
            },
            {
              test: /\.less$/,
              exclude: /node_modules/,
              oneOf: [
                {
                  resourceQuery: /modules/,
                  use: [
                    isEnvDev && require.resolve('style-loader'),
                    isEnvProd && {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    { loader: 'css-loader', options: { modules: true } },
                    {
                      loader: 'less-loader',
                      options: { lessOptions: { javascriptEnabled: true } },
                    },
                  ].filter(Boolean),
                },
                {
                  use: [
                    isEnvDev && require.resolve('style-loader'),
                    isEnvProd && {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    { loader: 'css-loader' },
                    {
                      loader: 'less-loader',
                      options: { lessOptions: { javascriptEnabled: true } },
                    },
                  ].filter(Boolean),
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
                      isEnvDev && require.resolve('react-refresh/babel'),
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
      new HtmlWebpackPlugin({ template: resolve('./public/index.html') }),
      isEnvDev && new CaseSensitivePathsPlugin(),
      isEnvDev && new webpack.HotModuleReplacementPlugin(),
      isEnvDev && new ReactRefreshWebpackPlugin(),
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
      // isEnvProd &&
      //   new PurgeCSSPlugin({
      //     paths: glob.sync(`${PATHS.src}/**/*`, {nodir: true}),
      //   }),
      isEnvProd &&
        new CompressionPlugin({
          test: /\.(js|css)$/i,
          algorithm: 'gzip',
          threshold: 10240, // Byte
        }),
      isEnvProd &&
        new webpack.DllReferencePlugin({
          context: process.cwd(),
          manifest: require(resolve(
            './public/vendor/vendorReact-manifest.json',
          )),
          name: 'vendor/vendorReact.dll.js',
          scope: 'react',
          sourceType: 'commonjs2',
        }),
    ].filter(Boolean),
    cache: isEnvDev && {
      type: 'filesystem',
      // cacheDirectory Base directory for the cache. Defaults to node_modules/.cache/webpack
    },
    devServer: {
      open: true,
      https: env.http,
      hot: true,
      overlay: true, // 浏览器页面上显示错误
      stats: 'errors-only', //stats: "errors-only"表示只打印错误：
      historyApiFallback: false, // 404 会被替代为 index.html
      inline: true, // 内联模式，实时刷新
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
