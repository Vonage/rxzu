module.exports = function ({ config }) {
	config.module.rules.push({
		test: /\.stories\.ts?$/,
		loaders: [
			{
				loader: require.resolve('@storybook/addon-storysource'),
				options: { parser: 'typescript' },
			},
		],
		enforce: 'pre',
	});

	return config;
};
