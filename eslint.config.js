import eslint from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
	eslint.configs.recommended,
	tseslint.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	...svelte.configs.recommended,
	{ languageOptions: { globals: globals.browser } },
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { svelteConfig } }
	},
	{
		plugins: { import: importPlugin },
		settings: {
			'import/resolver': { typescript: true, node: true },
			'import/internal-regex': '^~/'
		},
		rules: {
			'import/order': [
				'warn',
				{
					groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index'], ['type']],
					alphabetize: { order: 'asc', caseInsensitive: true }
				}
			],
			'import/newline-after-import': 'warn',
			'no-undef': 'off',
			'solid/no-innerhtml': 'off'
		}
	}
];
