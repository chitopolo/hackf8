// var path = require('path');

// module.exports = {
//   entry: './src/index.js',
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist')
//   },
//   module: {
//   rules: [
//     {
//       test: /\.js$/,
//       exclude: /(node_modules|bower_components)/,
//       use: {
//         loader: 'babel-loader',
//         options: {
//           presets: ['env', 'react']
//         }
//       }
//     }
//   ]
// }
// };




// development
var path = require('path');
var webpack = require('webpack');

// var APP_DIR = path.resolve(__dirname, './src');

module.exports = {
  context: __dirname,
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index.js'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  devServer:{
    hot:true,
     path: path.join(__dirname, 'dist'),
     publicPath:'/'
  },
  resolve: {
      extensions: ['.js', '.jsx', '.json'],
      modules: ["node_modules"],
    
   },
   stats: {
     colors:true,
     reasons:true,
     chunks:true
   },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [{

      test: /\.js$/,
       use: [
               {
                 loader: "react-hot-loader/webpack"
               },
               {
                 loader: "babel-loader"
               }
        ],
        
   exclude: /node_modules/
 }, {
      test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
      loader: "file"
    }]
  }
};



// // Production


// var path = require('path');
// var webpack = require('webpack');
// var CompressionPlugin = require('compression-webpack-plugin');
// // var APP_DIR = path.resolve(__dirname, './src');




// module.exports = {
//   // devtool:'cheap-module-source-map',
//   entry: [
//     './src/index.js'
//   ],
//   output: {
//     path: path.join(__dirname, 'dist'),
//     filename: 'bundle.js',
//     publicPath: '/dist/'
//   },
//   resolve: {
//      modules: ["node_modules"],
//     extensions: ['.js', '.jsx', '.json'],
 
//   },
//   plugins: [

//   new webpack.DefinePlugin({ // <-- key to reducing React's size
//         'process.env': {
//           'NODE_ENV': JSON.stringify('production')
//         }
//       }),
//   new webpack.optimize.UglifyJsPlugin({
//       compress: { warnings: false },
//       comments: false,
//       sourceMap: true,
//       minimize: false
//     }),
//   new webpack.optimize.AggressiveMergingPlugin(),//Merge chunks
//   new webpack.LoaderOptionsPlugin({
//        minimize: true,
//        debug: false
//      }),

//   new CompressionPlugin({  
//         asset: "[path].gz[query]",
//         algorithm: "gzip",
//         test: /\.js$|\.css$|\.html$/,
//         threshold: 10240,
//         minRatio: 0.8
//       })
//   ],
//   module: {
//       rules: [{
//         test: /\.js$/,
//          use: [
//                  {
//                    loader: "babel-loader"
//                  }
//       ],
//    exclude: /node_modules/
//     }, {
//         test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
//         loader: "file"
//       }]
//     }
// };
