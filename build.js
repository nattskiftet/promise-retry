const fse = require('fs-extra');
const babel = require('@babel/core');

babel.transformFile(
	'./index.js',
	{
		comments: false,
		minified: true,
		presets: [
			[
				'@babel/preset-env',
				{
					useBuiltIns: 'usage',
					targets: {
						browsers: ['> 0.25%']
					}
				}
			]
		],
		plugins: [
			[
				'@babel/plugin-transform-runtime'
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
