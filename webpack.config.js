const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const resolve = (dir) => path.resolve(__dirname, dir)

module.exports = (env) => {
  const isEnvDev = env.development
  const isEnvProd = env.production
  process.env.BABEL_ENV = isEnvDev ? 'development' : 'production'
  process.env.NODE_ENV = isEnvDev ? 'development' : 'production'

  return {
    mode: isEnvDev ? 'development' : 'production',
    // prod 模式下，只要出错就停止编译
    bail: isEnvProd,
    // 默认配置，无需写
    // entry: './src/index.js',
    output: {
      path: resolve('dist'),
      // 包名称
      filename: 'js/[name].[contenthash:8].js',
      // 块名，公共块名(非入口)
      chunkFilename: 'js/[name].[contenthash:8].js',
      publicPath: '',
    },
    // 原始源代码（仅限行）
    devtool: isEnvDev ? 'cheap-module-source-map' : 'none',
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      alias: {
        '@': resolve('src'),
      },
    },
    module: {
      rules: [
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
                {loader: 'css-loader', options: {modules: true}},
              ].filter(Boolean),
            },
            {
              use: [
                isEnvDev && require.resolve('style-loader'),
                isEnvProd && {
                  loader: MiniCssExtractPlugin.loader,
                },
                {loader: 'css-loader'},
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
                {loader: 'css-loader', options: {modules: true}},
                {
                  loader: 'less-loader',
                  options: {lessOptions: {javascriptEnabled: true}},
                },
              ].filter(Boolean),
            },
            {
              use: [
                isEnvDev && require.resolve('style-loader'),
                isEnvProd && {
                  loader: MiniCssExtractPlugin.loader,
                },
                {loader: 'css-loader'},
                {
                  loader: 'less-loader',
                  options: {lessOptions: {javascriptEnabled: true}},
                },
              ].filter(Boolean),
            },
          ],
        },
        {
          test: /.[tj]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: [
                  '@umijs/babel-plugin-auto-css-modules',
                  ['@babel/plugin-proposal-decorators', {legacy: true}],
                  isEnvDev && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
          generator: {
            filename: 'assets/[hash:8].[name][ext]',
          },
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
          // 发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现
          type: 'asset/resource',
          generator: {
            filename: 'assets/[hash:8].[name][ext]',
          },
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf|)$/,
          // 导出一个资源的 data URI。之前通过使用 url-loader 实现
          type: 'asset/inline',
        },
      ],
    },
    optimization: {
      // 被哈希转化成的小位数值模块名，有益于长期缓存，默认不开启
      moduleIds: isEnvProd && 'deterministic',
      // 在不同的编译中不变的短数字 id，有益于长期缓存，生产环境中默认开启
      // chunkIds: 'deterministic',
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
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        // `...`,
        new CssMinimizerPlugin(),
      ],
    },
    plugins: [
      new ESLintPlugin(),
      new HtmlWebpackPlugin({template: resolve('./public/index.html')}),
      // new ModuleNotFoundPlugin(paths.appPath),
      isEnvDev && new CaseSensitivePathsPlugin(),
      isEnvDev && new webpack.HotModuleReplacementPlugin(),
      isEnvDev && new ReactRefreshWebpackPlugin(),
      isEnvProd &&
        new CleanWebpackPlugin({
          // verbose Write logs to console.
          verbose: false, //开启在控制台输出信息
        }),
      isEnvProd &&
        new PurgecssPlugin({
          paths: paths.appSrc,
        }),
      isEnvProd &&
        new CompressionPlugin({
          test: /\.(js|css)$/i,
          algorithm: 'gzip',
          threshold: 10240, // Byte
        }),
      new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest: require(resolve('./public/vendor/vendorReact-manifest.json')),
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
