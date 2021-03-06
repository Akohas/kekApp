const webpack = require('webpack');
const path = require('path');


const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

const nodeEnv = process.env.NODE_ENV  || 'development';
const isProduction = nodeEnv === "production";



const jsSourcePath = path.join(__dirname, './client/source/js');
const buildPath = path.join(__dirname, './server/public');
const imgPath = path.join(__dirname, './client/source/assets');
const sourcePath = path.join(__dirname, './client/source');

const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');



// Common plugins
const plugins = [

    new SpriteLoaderPlugin(),

  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.js',
    minChunks(module) {
      const context = module.context;
      return context && context.indexOf('node_modules') >= 0;
    },
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv),
    },
  }),
    new ExtractTextPlugin('style.css'),
  new webpack.LoaderOptionsPlugin({
    options: {
      postcss: [
        autoprefixer({
          browsers: [
            'last 3 version',
            'ie >= 10',
          ],
        }),
      ],
      context: sourcePath,
    },
  }),
];

// Common rules
const rules = [
    {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [
      'babel-loader',
    ],
  },
    {
        test: /\.svg$/,
       loader: 'svg-sprite-loader'

    },
  {
    test: /\.(png|gif|jpg)$/,
    include: imgPath,
    use: 'url-loader?limit=20480&name=/../assets/[name].[ext]',
  },
  {
    test: /\.scss$/,
    exclude: /node_modules/,
    use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
      use: ['css-loader', 'postcss-loader', 'sass-loader']
    }))

  }


];

if (isProduction) {
  // Production plugins
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    })
  );


} else {
  // Development plugins
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
  );

}


module.exports = {
  devtool: isProduction ? false : 'source-map',
  context: jsSourcePath,
  entry: {
    js: './index.jsx',
  },
  output: {
    path: buildPath,
    publicPath:  isProduction ? '' : '/static',
    filename: 'app.js',
  },
  module: {
    rules,
  },
  resolve: {
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      jsSourcePath,
    ],
  },
  plugins,
  devServer: {
      historyApiFallback: true,
      proxy: [{
          path: '/api/**',
          target: 'http://localhost:3001'
      },
        {
          path: '/auth/**',
          target: 'http://localhost:3001'
        }],
      port: 8001
  }
};
