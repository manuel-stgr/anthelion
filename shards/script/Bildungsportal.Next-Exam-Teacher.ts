import ky from 'ky';

import { defineShard } from '@/schema/script-shard.ts';

export default defineShard(async () => {
	const release = await ky(
		'https://api.github.com/repos/Bildungsportal/next-exam/releases/latest',
		{
			headers: {
				Accept: 'application/vnd.github+json',
				...(process.env.GITHUB_TOKEN
					? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
					: {}),
			},
		},
	).json<{
		assets: Array<{ name: string; browser_download_url: string }>;
	}>();

	const msiAsset = release.assets.find(
		(asset) =>
			asset.name.startsWith('Next-Exam-Teacher_') &&
			asset.name.endsWith('_x64.msi'),
	);

	if (!msiAsset) {
		throw new Error('No Teacher MSI asset found in latest release');
	}

	const versionMatch = msiAsset.name.match(/^Next-Exam-Teacher_([^_]+)_/);
	if (!versionMatch) {
		throw new Error(`Could not extract version from asset name: ${msiAsset.name}`);
	}

	const version = versionMatch[1];
	const urls = () => [msiAsset.browser_download_url];

	return {
		version,
		urls,
	};
});
