import { defineConfig } from '@lunariajs/core/config';

export default defineConfig({
	repository: {
		name: 'thingsboard/thingsboard.io',
		branch: 'main',
	},
	sourceLocale: {
		label: 'English',
		lang: 'en',
	},
	locales: [
		{
			label: 'Українська',
			lang: 'uk',
		},
	],
	files: [
		{
			include: ['src/content/docs/docs/**/*.mdx'],
			pattern: {
				source: 'src/content/docs/docs/@path',
				locales: 'src/content/docs/@lang/docs/@path',
			},
			type: 'universal',
		},
	],
	tracking: {
		localizableProperty: 'i18nReady',
		ignoredKeywords: [
			'lunaria-ignore',
			'typo',
			'en-only',
			'broken link',
			'i18nReady',
			'i18nIgnore',
		],
	},
});
