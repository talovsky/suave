<script lang="ts">
	import { router } from './lib/routes';
	import { browserLocation } from './lib/router';
	import Page from './lib/Page.svelte';
	import Page2 from './lib/Page2.svelte';

	// Single reactive store - Svelte auto-cleans subscriptions!
	let page = $derived($router);

	// Get actual current path (even if no route matches)
	const [location] = browserLocation();
	let currentPath = $derived($location);
</script>

<div class="app">
	<header>
		<h1>🪄 Grimoire Router Demo</h1>
		<p class="subtitle">A dumb router for Svelte 5</p>
	</header>

	<nav>
		<a href="/" class:active={page?.route === 'home'}>🏠 Home</a>
		<a href="/page" class:active={page?.route === 'page'}>📄 Page 1</a>
		<a href="/page2" class:active={page?.route === 'page2'}>📄 Page 2</a>
		<a href="/people/merlin" class:active={page?.route === 'person'}>🧙 Profiles</a>
	</nav>

	<main>
		<div class="breadcrumb">
			<code>{currentPath}</code>
		</div>

		{#if !page}
			<div class="error">
				<h2>404 - Page Not Found</h2>
				<p>The path <code>{currentPath}</code> doesn't match any routes.</p>
				<button onclick={() => router.open('/')}>Go Home</button>
			</div>
		{:else if page.route === 'home'}
			<div class="content">
				<h2>Welcome to the Grimoire!</h2>
				<p>This is a demo of the <strong>wouter-svelte</strong> router.</p>

				<div class="features">
					<h3>✨ Features:</h3>
					<ul>
						<li>✅ Automatic <code>&lt;a&gt;</code> tag interception</li>
						<li>✅ No custom components needed</li>
						<li>✅ Type-safe route names</li>
						<li>✅ Dynamic params (<code>:name</code>)</li>
						<li>✅ 8.9 KB gzipped</li>
					</ul>
				</div>

				<div class="actions">
					<h3>Try it out:</h3>
					<button onclick={() => router.open('/page')}>Visit Page 1</button>
					<button onclick={() => router.open('page2')}>Visit Page 2 (by route name)</button>
					<button onclick={() => router.open('person', { name: 'gandalf' })}>Visit Gandalf's Profile</button>
				</div>

				<div class="code">
					<h3>Current route data:</h3>
					<pre>{JSON.stringify(page, null, 2)}</pre>
				</div>
			</div>
		{:else if page.route === 'person'}
			<div class="content">
				<h2>👤 {page.params.name}</h2>
				<p>This is <strong>{page.params.name}</strong>'s profile page.</p>
				<p>The name comes from the URL parameter: <code>:name</code></p>

				<div class="actions">
					<h3>Visit other profiles:</h3>
					<a href="/people/merlin">Merlin</a>
					<a href="/people/gandalf">Gandalf</a>
					<a href="/people/dumbledore">Dumbledore</a>
				</div>

				<div class="code">
					<h3>Route params:</h3>
					<pre>{JSON.stringify(page.params, null, 2)}</pre>
				</div>
			</div>
		{:else if page.route === 'page'}
			<div class="content">
				<h2>📄 Page 1</h2>
				<Page />
				<button onclick={() => router.open('/page2')}>Go to Page 2</button>
			</div>
		{:else if page.route === 'page2'}
			<div class="content">
				<h2>📄 Page 2</h2>
				<Page2 />
				<button onclick={() => router.open('/page')}>Go to Page 1</button>
			</div>
		{/if}
	</main>

	<footer>
		<p>
			Built with wouter-svelte • <a href="https://github.com" target="_blank">GitHub</a>
		</p>
	</footer>
</div>

<style>
	.app {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #eee;
	}

	header h1 {
		margin: 0;
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: #666;
		margin: 0.5rem 0 0;
	}

	nav {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	nav a {
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: #333;
		border-radius: 4px;
		transition: all 0.2s;
	}

	nav a:hover {
		background: #e0e0e0;
	}

	nav a.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-weight: 600;
	}

	main {
		min-height: 400px;
	}

	.breadcrumb {
		padding: 0.5rem 1rem;
		background: #fafafa;
		border-left: 3px solid #667eea;
		margin-bottom: 2rem;
		border-radius: 4px;
	}

	.breadcrumb code {
		color: #667eea;
		font-weight: 600;
	}

	.content {
		animation: fadeIn 0.3s;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.error {
		text-align: center;
		padding: 3rem;
		background: #fff3f3;
		border-radius: 8px;
	}

	.error h2 {
		color: #d32f2f;
	}

	.features,
	.actions,
	.code {
		margin: 2rem 0;
		padding: 1.5rem;
		background: #fafafa;
		border-radius: 8px;
	}

	.features h3,
	.actions h3,
	.code h3 {
		margin-top: 0;
		color: #667eea;
	}

	.features ul {
		list-style: none;
		padding: 0;
	}

	.features li {
		padding: 0.5rem 0;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.actions a {
		display: inline-block;
		margin-right: 1rem;
		padding: 0.5rem 1rem;
		background: white;
		border: 2px solid #667eea;
		color: #667eea;
		text-decoration: none;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.actions a:hover {
		background: #667eea;
		color: white;
	}

	button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: transform 0.2s;
	}

	button:hover {
		transform: translateY(-2px);
	}

	button:active {
		transform: translateY(0);
	}

	pre {
		background: white;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.9rem;
	}

	code {
		background: #f0f0f0;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Courier New', monospace;
	}

	footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 2px solid #eee;
		text-align: center;
		color: #666;
	}

	footer a {
		color: #667eea;
		text-decoration: none;
	}

	footer a:hover {
		text-decoration: underline;
	}
</style>
