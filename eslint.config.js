import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ ignores: ['dist/**'] },
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{ languageOptions: { globals: globals.browser } },
	{
		plugins: { import: importPlugin },
		rules: {
			'import/order': [
				'warn',
				{
					groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index'], ['type']],
					alphabetize: { order: 'asc', caseInsensitive: true }
				}
			],
			'import/newline-after-import': 'warn',
			'no-undef': 'off'
		}
	}
];
