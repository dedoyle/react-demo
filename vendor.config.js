const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin

const dllPath = './public/vendor'

// const vendorVue = ['vue', 'vue-router', 'vuex', 'vuex-persistedstate']
// , 'moment'
const vendorReact = [
  'react',
  'react-dom',
  'react-router-dom',
  'mobx',
  'react-refresh/runtime',
]

process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

module.exports = {
  mode: 'production',
  entry: {
    // 需要提取的库文件
    // vendorVue,
    vendorReact,
  },
  output: {
    path: path.resolve(__dirname, dllPath),
    filename: '[name].[chunkhash].js',
    // vendor.dll.js中暴露出的全局变量名
    // 保持与 webpack.DllPlugin 中名称一致
    library: '[name]_[chunkhash]',
  },
  plugins: [
    // 清除之前的dll文件
    new CleanWebpackPlugin(),
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // 设置环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    // manifest.json 描述动态链接库包含了哪些内容
    new webpack.DllPlugin({
      path: path.join(__dirname, dllPath, '[name]-manifest.json'),
      // 保持与 output.library 中名称一致
      name: '[name]_[chunkhash]',
      context: process.cwd(),
    }),
    new CompressionPlugin({
      test: /\.(js|html|json|css)$/,
      threshold: 10240,
      deleteOriginalAssets: false,
    }),
    // new BundleAnalyzerPlugin(),
  ],
}
