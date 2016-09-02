/// <binding BeforeBuild='Run - Development' ProjectOpened='Watch - Development' />
"use strict";

module.exports = {
    entry: './src/index.jsx',
    output: {
        path: './build/',
        filename: 'app.js', 
        publicPath: './build/'
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['react']
                }
            },
              {
                  test: /\.css$/,
                  loader: "style-loader!css-loader"
              },
              {
                  test: /\.png$/,
                  loader: "url-loader?limit=100000"
              },
              {
                  test: /\.jpg$/,
                  loader: "file-loader"
              },
              {
                  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                  loader: 'url?limit=10000&mimetype=application/font-woff'
              },
              {
                  test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                  loader: 'url?limit=10000&mimetype=application/octet-stream'
              },
              {
                  test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                  loader: 'file'
              },
              {
                  test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                  loader: 'url?limit=10000&mimetype=image/svg+xml'
              }
        ]
    },
    
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
}