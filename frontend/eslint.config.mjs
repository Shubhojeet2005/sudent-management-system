import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	js.configs.recommended,
	{
		files: ['src/**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: { ecmaFeatures: { jsx: true } },
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
]);
