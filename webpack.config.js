const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app/app.ts',
  devtool: 'inline-source-map',
  target: 'web',
  devServer: {
    static: {
        directory: path.join(__dirname, 'dist'),
    },
    devMiddleware: {
        publicPath: '/',
    },
    hot: true,
    
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
   
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: {
            loader: 'html-loader',
            options: {
                esModule: false 
            }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'images/',
                },
            },
        ],
      }
    ],
      
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
};
