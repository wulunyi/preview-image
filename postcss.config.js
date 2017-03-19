/**
 * @description postcss 配置文件
 */

module.exports = {
	plugins: [
		require('precss'),
		require('autoprefixer')
	]
};