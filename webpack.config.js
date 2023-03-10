/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const path = require('path')
const { merge } = require('webpack-merge')
const htmlPlugin = require('html-webpack-plugin')
const eslint = require('eslint-webpack-plugin')
const shellPlugin = require('webpack-shell-plugin-next')
const cssExtractPlugin = require('mini-css-extract-plugin')
const cssMiniPlugin = require('css-minimizer-webpack-plugin')

const { NODE_ENV = 'production' } = process.env

const BaseConfig = {
  mode: NODE_ENV,
  module: {
    rules: [
      {
        test: /\.(?:jpe?g|png|gif|webp)$/i,
        type: 'asset/inline'
      },
      {
        test: /\.(?:ttf|otf|woff(2)?)$/i,
        type: 'asset/inline'
        // generator: { outputPath: 'assets/fonts', publicPath: '/assets/fonts/' }
      },
      {
        test: /\.(?:[tj]sx?)$/i,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(?:svg)$/i,
        exclude: /node_modules/,
        issuer: /\.(?:[jt]sx?)$/i,
        use: ['@svgr/webpack']
      },
      {
        test: /\.(?:s?[ac]ss)$/i,
        exclude: /node_modules/,
        use: [
          NODE_ENV === 'development' ? 'style-loader' : cssExtractPlugin.loader,
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader',
          'sass-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: { src: path.resolve(__dirname, 'src') },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.svg', '.sass', '.scss']
  },
  plugins: [
    new eslint({
      extensions: ['.tsx', '.ts', '.jsx', '.js']
    })
  ],
  optimization: {
    minimizer: ['...', new cssMiniPlugin()]
  },
  infrastructureLogging: {
    level: 'info',
    debug: ['sass-loader']
  },
  stats: {
    loggingDebug: ['sass-loader']
  }
}

const AppConfig = {
  entry: './src/app/index.tsx',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'out/app'),
    clean: true
  },
  target: 'electron-renderer',
  plugins: [
    new htmlPlugin({
      template: './src/app/index.html'
    })
  ],
  watch: NODE_ENV === 'development'
}

NODE_ENV === 'production' && AppConfig.plugins.push(new cssExtractPlugin())

const PreloadConfig = {
  entry: './src/electron/preload.ts',
  output: {
    filename: 'preload.js',
    path: path.resolve(__dirname, 'out')
  },
  target: 'electron-preload',
  watch: false
}

const ElectronConfig = {
  entry: './src/electron/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'out'),
    clean: {
      keep: /(app\/|preload\.js)/
    }
  },
  target: 'electron-main',
  node: {
    __dirname: false
  },
  plugins: [],
  watch: false
}

NODE_ENV === 'development' &&
  ElectronConfig.plugins.push(
    new shellPlugin({
      onBuildEnd: {
        scripts: ['electron .'],
        blocking: false,
        parallel: true
      }
    })
  )

module.exports = [
  merge(AppConfig, BaseConfig),
  merge(PreloadConfig, BaseConfig),
  merge(ElectronConfig, BaseConfig)
]
