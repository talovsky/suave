# suave

A small client-side router for pure Svelte 5 apps.

## Install

```bash
pnpm add suave
```

## Quick start

```ts
// src/lib/router.ts
import { createRouter } from 'suave';

export const router = createRouter({
	home: '/',
	about: '/about',
	user: '/users/:id'
});
```

```svelte
<script lang="ts">
	import { router } from '$lib/router';

	const page = $derived($router);
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/users/42">User 42</a>
</nav>

{#if page?.route === 'home'}
	<h1>Home</h1>
{:else if page?.route === 'about'}
	<h1>About</h1>
{:else if page?.route === 'user'}
	<h1>User {page.params.id}</h1>
{:else}
	<h1>Not found</h1>
{/if}
```

## `createRouter(routes, config?)`

Creates a single readable store with the current route data.

### Routes

- Static: `'/about'`
- Param: `'/users/:id'`
- Optional param: `'/posts/:slug?'`

### Returned store value

`router` resolves to `RouterPage | null`:

- `route`: matched route key
- `params`: route params object
- `search`: parsed query params (`string` or `string[]` for repeated keys)
- `hash`: current `window.location.hash`
- `path`: current path relative to configured base

When no route matches, the store value is `null`.

### Router config

- `base?: string` - base path prefix for deployment under a subpath
- `hash?: boolean` - use hash routing (`#/path`) instead of pathname routing
- `links?: boolean` - enable document-level `<a>` interception (default `true`)

## Navigation API

### `router.open(pathOrRoute, params?, options?)`

- `pathOrRoute`: either a literal path (`'/about'`) or a route key (`'user'`)
- `params`: used when opening by route key
- `options.replace`: use `history.replaceState`
- `options.state`: history state payload

### `router.getPath(route, params?, search?)`

Builds a path string from a route key, route params, and optional search params.

## Search params helper

### `createSearchParams()`

Returns `[searchStore, setSearchParams]`.

- `searchStore`: readable `URLSearchParams`
- `setSearchParams(next, options?)`: accepts
  - query string
  - `URLSearchParams`
  - object map
  - updater function `(current) => next`

## Link interception rules

With `links: true`, the router intercepts `<a>` navigation at the document level.

Ignored links:

- links with `target` or `download`
- links marked `data-native` or `data-external`
- `mailto:` and `tel:`
- external URLs (including protocol-relative `//...`)
- hash-only links (`#section`)

Supported attributes:

- `data-replace` - use replace navigation
- `data-state='{"from":"menu"}'` - JSON-encoded history state
- `~` prefix in `href` - absolute app path, ignores `base` stripping logic

## Browser-only usage

This package is for browser environments. Calling router APIs in non-browser contexts throws a clear runtime error.

## Notes

- Route matching uses declaration order; put more specific routes first.
- This package targets pure Svelte apps. SvelteKit already includes its own router.
