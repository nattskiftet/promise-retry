const fse = require('fs-extra');
const babel = require('@babel/core');

babel.transformFile(
	'./index.js',
	{
		minified: true,
		babelrc: false,
		configFile: false,
		presets: [
			[
				'@babel/preset-env',
				{
					modules: 'commonjs',
					targets: {
						browsers: ['> 1%']
					}
				}
			]
		],
		plugins: [
			[
				'@babel/plugin-transform-runtime',
				{
					corejs: 2,
					helpers: true,
					useESModules: false
				}
			]
		]
	},

	async (error, {code}) => {
		if (error) {
			console.error(error);
		} else {
			await fse.ensureFile('./index.browser.js');
			fse.writeFile('./index.browser.js', code, 'utf-8');
		}
	}
);
