/**
 * @description 生产环境配置
 */

import webpack from 'webpack';
import path    from 'path';

// 目录变量
let SRC_PATH  = path.resolve('src');
let LIB_PATH  = path.resolve('lib');

module.exports = {
	entry: {
		index: path.resolve('src/preview-image.js')
	},

	output: {
		filename: 'preview-image.js',
		path    : LIB_PATH,
		library : 'PreviewImage',
		libraryTarget :  'umd',
		umdNamedDefine: true
	},

	externals: {
		"alloyfinger": {
			commonjs: "alloyfinger",
			commonjs2: "alloyfinger",
			amd: "alloyfinger",
			root: "alloyfinger"
		}
	},

	resolve: {
		extensions: ['.js'],
		modules   : ['node_modules', SRC_PATH],
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				include: SRC_PATH,
				exclude: path.resolve('node_modules'),
				use: [
					{loader: 'babel-loader'}
				]
			},
			{
				test: /\.scss$/,
				include: SRC_PATH,
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

	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			output: {
				comments: false,
				beautify: false,
			},
			compress: {
				warnings: false,
				conditionals: true,
				unused: true,
				comparisons: true,
				sequences: true,
				dead_code: true,
				evaluate: true,
				if_return: true,
				join_vars: true,
				negate_iife: false,
				drop_console: true,
				collapse_vars: true,
				reduce_vars: true,
			}
		})
	]
};
