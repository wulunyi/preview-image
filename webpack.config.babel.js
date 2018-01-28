/**
 * @description 配置文件
 */

import webpack from 'webpack';
import path    from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// 目录变量
let SRC_PATH  = path.resolve('src');
let DIST_PATH = path.resolve('dist');
let DEMO_PATH = path.resolve('demo');

module.exports = {
	entry: {
		index: path.resolve('demo/index.js')
	},

	output: {
		filename: '[name].bundle.js',
		path    : DIST_PATH
	},

	resolve: {
		extensions: ['.js', '.json', '.scss', '.ts'],
		modules   : ['node_modules', SRC_PATH],
		alias     : {
			styles: path.join(SRC_PATH, 'styles'),
			images: path.join(SRC_PATH, 'images'),
			libs  : path.join(SRC_PATH, 'libs'),
			core  : path.join(SRC_PATH, 'core')
		}
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				include: [SRC_PATH, DEMO_PATH],
				exclude: path.resolve('node_modules'),
				use: [
					{loader: 'babel-loader'}
				]
			},
			{
				test: /\.ts$/,
				exclude: path.resolve('node_modules'),
				use: [
					{loader: 'babel-loader'},
					{loader: 'awesome-typescript-loader'}
				]
			},
			{
				test: /\.scss$/,
				include: [SRC_PATH, DEMO_PATH],
				exclude: path.resolve('node_modules'),
				use: [
					{loader: 'style-loader'},
					{loader: 'css-loader'},
					{loader: 'postcss-loader'},
					{
						loader: 'px2rem-loader',
						options:{
							remUnit: 75,
							remPrecision: 8
						}
					},
					{loader: 'sass-loader'}
				]
			}
		]
	},

	devServer: {
		compress: true,
		port: 9000,
		host: 'localhost',
		publicPath: '/',
		contentBase: SRC_PATH,
		historyApiFallback: true,
		open: true,
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve('demo/index.html')
		})
	]
};