import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html', // SPA ve Supabase Auth için ŞART!
			precompress: false,
			strict: true
		}),
		paths: {
            // DİKKAT: GitHub Repo adın neyse buraya onu yaz. 
            // Örneğin reponun adı "solo-panel" ise '/solo-panel' yazmalısın.
			base: process.argv.includes('dev') ? '' : '/repo-adini-buraya-yaz'
		}
	}
};

export default config;