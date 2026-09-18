import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/cjs/index.js',
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: 'dist/es/index.js',
				format: 'es',
				sourcemap: true,
			}
		],
		plugins: [typescript(), terser()],
		external: ['on-finished', 'on-headers', 'path'],
	}
];