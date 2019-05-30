module.exports = (wallaby) => ({
	testFramework: 'jest',

	files: [
		'**/!(*.test).js',
		'!node_modules/**',
	],

	tests: [
		'**/*.test.js',
		'!node_modules/**',
	],

	env: {
		type: 'node',
	},

	compilers: {
		'**/*.js': wallaby.compilers.babel(),
	},

	filesWithNoCoverageCalculated: [
		'**/*.conf.js',
	],
});