import terser from '@rollup/plugin-terser';

export default [
	{
		input: 'src/index.js',
		output: {
			file: 'dist/esm/index.min.js',
			format: 'es',
			sourcemap: true,
		},
		plugins: [terser()],
		external: ['on-finished', 'on-headers', 'path'],
	},
	{
		input: 'src/index.js',
		output: {
			file: 'dist/cjs/index.min.js',
			format: 'cjs',
			sourcemap: true,
		},
		plugins: [terser()],
		external: ['on-finished', 'on-headers', 'path'],
	},
];