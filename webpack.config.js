const path = require('path')
const resolve = (dir) => path.resolve(__dirname, dir)
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
module.exports = {
  // 默认配置，无需写
  // entry: './src/index.js',
  output: {
    filename: 'bundle.[contenthash:8].js',
    path: resolve('dist'),
  },
  devtool: 'source-map', // 调试的时候可以快速找到错误代码
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        oneOf: [
          {
            resourceQuery: /modules/,
            use: [
              { loader: 'style-loader' },
              { loader: 'css-loader', options: { modules: true } },
              { loader: 'less-loader' },
            ],
          },
          {
            use: [
              { loader: 'style-loader' },
              { loader: 'css-loader' },
              { loader: 'less-loader' },
            ],
          },
        ],
      },
      {
        test: /.[tj]sx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  plugins: [
    new ESLintPlugin(),
    new HtmlWebpackPlugin({ template: resolve('public/index.html') }),
  ],
  devServer: {
    open: 'chrome',
  },
}
