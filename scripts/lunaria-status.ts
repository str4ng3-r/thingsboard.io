import { createLunaria } from '@lunariajs/core';

async function main() {
	console.log('Loading Lunaria configuration...\n');

	const lunaria = await createLunaria();

	console.log('Config:', JSON.stringify(lunaria.config, null, 2));

	const sourcePaths = await lunaria.getSourcePaths();
	console.log('\nSource paths found:', sourcePaths.length);
	if (sourcePaths.length > 0) {
		console.log('First 5 paths:', sourcePaths.slice(0, 5));
	}

	const status = await lunaria.getFullStatus();

	console.log('\n=== Translation Status ===\n');

	let totalFiles = 0;
	let translatedFiles = 0;
	let outdatedFiles = 0;
	let missingFiles = 0;

	for (const file of status) {
		totalFiles++;
		const sourcePath = file.source.path;

		console.log(`Source: ${sourcePath}`);

		for (const localization of file.localizations) {
			const lang = localization.lang;
			const locStatus = localization.status;

			if (locStatus === 'up-to-date') {
				translatedFiles++;
				console.log(`  [${lang}] ✓ Up to date`);
			} else if (locStatus === 'outdated') {
				outdatedFiles++;
				console.log(`  [${lang}] ⚠ Outdated (needs update)`);
			} else if (locStatus === 'missing') {
				missingFiles++;
				console.log(`  [${lang}] ✗ Missing`);
			} else {
				console.log(`  [${lang}] ? ${locStatus}`);
			}
		}
		console.log('');
	}

	console.log('=== Summary ===');
	console.log(`Total source files: ${totalFiles}`);
	console.log(`Translated (up-to-date): ${translatedFiles}`);
	console.log(`Outdated: ${outdatedFiles}`);
	console.log(`Missing: ${missingFiles}`);

	const coverage = totalFiles > 0 ? ((translatedFiles / totalFiles) * 100).toFixed(1) : 0;
	console.log(`\nTranslation coverage: ${coverage}%`);
}

main().catch(console.error);
