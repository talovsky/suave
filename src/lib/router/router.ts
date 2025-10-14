/**
 * svouter - Standalone Single File Version
 *
 * The dumbest router for Svelte 5 - everything in one file!
 * Just copy this file to your project and you're good to go.
 *
 * Dependencies:
 * - svelte (peer dependency)
 * - regexparam (for route matching)
 */

import { parse as parsePattern } from 'regexparam';
import { writable, derived, readable, get, type Readable } from 'svelte/store';

export interface RouterPage<Routes extends Record<string, string>> {
	route: keyof Routes;
	params: Record<string, string>;
	search: Record<string, string | string[]>;
	hash: string;
	path: string;
}

export interface Router<Routes extends Record<string, string>> {
	subscribe: Readable<RouterPage<Routes> | null>['subscribe'];
	open: (
		pathOrRoute: string | keyof Routes,
		params?: Record<string, string>,
		options?: { replace?: boolean; state?: unknown }
	) => void;
	getPath: (route: keyof Routes, params?: Record<string, string>, search?: Record<string, string | string[]>) => string;
}

export interface RouterConfig {
	base?: string;
	hash?: boolean;
	links?: boolean;
}

export interface NavigateOptions {
	replace?: boolean;
	state?: unknown;
}

export type NavigateFunction = (to: string, options?: NavigateOptions) => void;

export type SetSearchParamsFunction = (
	nextInit:
		| string
		| URLSearchParams
		| Record<string, string>
		| ((current: URLSearchParams) => URLSearchParams | string | Record<string, string>),
	options?: { replace?: boolean; state?: unknown }
) => void;

// ============================================================================
// Browser Location Hook
// ============================================================================

const eventPopstate = 'popstate';
const eventPushState = 'pushState';
const eventReplaceState = 'replaceState';
const eventHashchange = 'hashchange';
const events = [eventPopstate, eventPushState, eventReplaceState, eventHashchange] as const;

const subscribeToLocationUpdates = (callback: () => void): (() => void) => {
	for (const event of events) {
		addEventListener(event, callback);
	}
	return () => {
		for (const event of events) {
			removeEventListener(event, callback);
		}
	};
};

const createLocationStore = <T>(fn: () => T): Readable<T> =>
	readable(fn(), (set) => subscribeToLocationUpdates(() => set(fn())));

const currentPathname = (): string => location.pathname;

export const browserLocation = (): [Readable<string>, NavigateFunction] => {
	const navigate: NavigateFunction = (to, { replace = false, state = null } = {}) =>
		history[replace ? eventReplaceState : eventPushState](state, '', to);

	return [createLocationStore(currentPathname), navigate];
};

// Monkey-patch history API (once)
const patchKey = Symbol.for('svelte-navigator');
if (typeof history !== 'undefined' && typeof (window as unknown as Record<symbol, unknown>)[patchKey] === 'undefined') {
	for (const type of [eventPushState, eventReplaceState] as const) {
		const original = history[type].bind(history);
		history[type] = function (data: unknown, unused: string, url?: string | URL | null): void {
			const result = original(data, unused, url);
			const event = new Event(type);
			Object.defineProperty(event, 'arguments', {
				value: { data, unused, url },
				enumerable: false
			});
			dispatchEvent(event);
			return result;
		};
	}
	Object.defineProperty(window, patchKey, { value: true });
}

// ============================================================================
// Hash Location Hook
// ============================================================================

const hashListeners: { v: Array<() => void> } = { v: [] };
const onHashChange = (): void => hashListeners.v.forEach((cb) => cb());

const subscribeToHashUpdates = (callback: () => void): (() => void) => {
	if (hashListeners.v.push(callback) === 1) addEventListener('hashchange', onHashChange);
	return () => {
		hashListeners.v = hashListeners.v.filter((i) => i !== callback);
		if (!hashListeners.v.length) removeEventListener('hashchange', onHashChange);
	};
};

const currentHashLocation = (): string => '/' + location.hash.replace(/^#?\/?/, '');

export const hashLocation = (): [Readable<string>, NavigateFunction] => {
	const navigate: NavigateFunction = (to, { state = null, replace = false } = {}) => {
		const [hash, search] = to.replace(/^#?\/?/, '').split('?');
		const newRelativePath = location.pathname + (search ? `?${search}` : location.search) + `#/${hash}`;
		const oldURL = location.href;
		const newURL = new URL(newRelativePath, location.origin).href;

		if (replace) {
			history.replaceState(state, '', newRelativePath);
		} else {
			history.pushState(state, '', newRelativePath);
		}

		const event =
			typeof HashChangeEvent !== 'undefined'
				? new HashChangeEvent('hashchange', { oldURL, newURL })
				: new Event('hashchange');

		dispatchEvent(event);
	};

	return [readable(currentHashLocation(), (set) => subscribeToHashUpdates(() => set(currentHashLocation()))), navigate];
};

// ============================================================================
// Link Interceptor
// ============================================================================

let _activeInterceptor: (() => void) | null = null;

const linkInterceptor = (navigate: NavigateFunction, base: string = ''): (() => void) => {
	if (_activeInterceptor) {
		_activeInterceptor();
		_activeInterceptor = null;
	}

	const handleNavigation = (anchor: HTMLAnchorElement, event: Event) => {
		if (event.defaultPrevented) return;

		if (
			anchor.hasAttribute('target') ||
			anchor.hasAttribute('download') ||
			anchor.hasAttribute('data-native') ||
			anchor.hasAttribute('data-external')
		) {
			return;
		}

		const href = anchor.getAttribute('href');
		if (!href) return;

		if (href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('://')) {
			try {
				const url = new URL(href, window.location.origin);
				if (url.origin !== window.location.origin) return;
			} catch {
				return;
			}
		}

		if (href.startsWith('#')) return;

		let targetPath = href;
		if (href.startsWith('~')) {
			targetPath = href.slice(1);
		} else if (!href.startsWith('/')) {
			return;
		} else if (base) {
			if (href === base) {
				targetPath = '/';
			} else if (href.startsWith(base + '/')) {
				targetPath = href.slice(base.length) || '/';
			}
		}

		event.preventDefault();

		const replace = anchor.hasAttribute('data-replace');
		const state = anchor.getAttribute('data-state');

		let parsedState: unknown = undefined;
		if (state) {
			try {
				parsedState = JSON.parse(state);
			} catch (e) {
				console.warn(`Failed to parse data-state attribute: ${state}`, e);
			}
		}

		navigate(targetPath, { replace, state: parsedState });
	};

	const onClick = (event: MouseEvent) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		const anchor = (event.target as Element).closest('a');
		if (!anchor) return;

		handleNavigation(anchor, event);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const anchor = (event.target as Element).closest('a');
		if (!anchor) return;

		handleNavigation(anchor, event);
	};

	document.addEventListener('click', onClick);
	document.addEventListener('keydown', onKeyDown);

	const cleanup = () => {
		document.removeEventListener('click', onClick);
		document.removeEventListener('keydown', onKeyDown);
		if (_activeInterceptor === cleanup) {
			_activeInterceptor = null;
		}
	};

	_activeInterceptor = cleanup;
	return cleanup;
};

// ============================================================================
// Path Utilities
// ============================================================================

const absolutePath = (to: string, base = ''): string => {
	if (!to.startsWith('/')) return to;
	if (!base) return to;
	return base + to;
};

const relativePath = (base: string, path: string): string => {
	if (!base) return path;
	if (path === base) return '/';
	if (path.startsWith(base + '/')) {
		return path.slice(base.length) || '/';
	}
	return path;
};

// ============================================================================
// Route Matching
// ============================================================================

function matchRoutes<Routes extends Record<string, string>>(
	routes: Routes,
	path: string
): { route: keyof Routes; params: Record<string, string> } | null {
	for (const [name, pattern] of Object.entries(routes)) {
		const { keys, pattern: regex } = parsePattern(pattern);
		const match = regex.exec(path);

		if (match) {
			const params: Record<string, string> = {};
			if (Array.isArray(keys)) {
				keys.forEach((key, i) => {
					params[key] = match[i + 1] || '';
				});
			}
			return { route: name as keyof Routes, params };
		}
	}
	return null;
}

function parseSearch(search: string): Record<string, string | string[]> {
	const params = new URLSearchParams(search);
	const result: Record<string, string | string[]> = {};

	params.forEach((value, key) => {
		const existing = result[key];
		if (existing !== undefined) {
			if (Array.isArray(existing)) {
				existing.push(value);
			} else {
				result[key] = [existing, value];
			}
		} else {
			result[key] = value;
		}
	});

	return result;
}

function buildPath<Routes extends Record<string, string>>(
	routes: Routes,
	route: keyof Routes,
	params: Record<string, string> = {}
): string {
	const pattern = routes[route];
	if (!pattern) {
		throw new Error(`Route "${String(route)}" not found`);
	}

	return pattern.replace(/:(\w+)(\?)?/g, (_, key, optional) => {
		const value = params[key];
		if (value === undefined) {
			if (optional) return '';
			throw new Error(`Missing required param "${key}" for route "${String(route)}"`);
		}
		return encodeURIComponent(value);
	});
}

// ============================================================================
// Main Router Factory
// ============================================================================

/**
 * Create a centralized router with all routes defined upfront.
 * Returns a single store that updates when the URL changes.
 *
 * The router is designed as a page-level singleton - create once at module scope
 * and use throughout your app. Svelte automatically cleans up component subscriptions.
 *
 * No manual cleanup needed! 🎉
 */
export function createRouter<Routes extends Record<string, string>>(
	routes: Routes,
	config: RouterConfig = {}
): Router<Routes> {
	const base = config.base || '';
	const useHash = config.hash || false;
	const autoLinks = config.links !== false;

	const [locationStore, navigate] = useHash ? hashLocation() : browserLocation();

	const routerStore = writable<RouterPage<Routes> | null>(null);

	locationStore.subscribe(($location) => {
		const path = relativePath(base, $location);
		const match = matchRoutes(routes, path);

		if (match) {
			routerStore.set({
				route: match.route,
				params: match.params,
				search: parseSearch(window.location.search),
				hash: window.location.hash,
				path
			});
		} else {
			routerStore.set(null);
		}
	});

	if (autoLinks) {
		linkInterceptor(navigate, base);
	}

	const open: Router<Routes>['open'] = (pathOrRoute, params, options) => {
		let finalPath: string;

		if (typeof pathOrRoute === 'string' && routes[pathOrRoute] !== undefined) {
			finalPath = buildPath(routes, pathOrRoute as keyof Routes, params);
		} else {
			finalPath = pathOrRoute as string;
		}

		const fullPath = absolutePath(finalPath, base);
		navigate(fullPath, options);
	};

	const getPath: Router<Routes>['getPath'] = (route, params, search) => {
		let path = buildPath(routes, route, params);

		if (search && Object.keys(search).length > 0) {
			const searchParams = new URLSearchParams();
			for (const [key, value] of Object.entries(search)) {
				if (Array.isArray(value)) {
					value.forEach((v) => searchParams.append(key, v));
				} else {
					searchParams.append(key, value);
				}
			}
			path += '?' + searchParams.toString();
		}

		return path;
	};

	return {
		subscribe: routerStore.subscribe,
		open,
		getPath
	};
}

// ============================================================================
// Search Params Helper
// ============================================================================

export function createSearchParams(): [Readable<URLSearchParams>, SetSearchParamsFunction] {
	const getSearch = () => window.location.search;

	const searchStringStore: Readable<string> = readable(getSearch(), (set) => {
		const onPopState = () => set(getSearch());
		window.addEventListener('popstate', onPopState);

		const onLocationChange = () => set(getSearch());
		window.addEventListener('pushstate', onLocationChange as EventListener);
		window.addEventListener('replacestate', onLocationChange as EventListener);

		return () => {
			window.removeEventListener('popstate', onPopState);
			window.removeEventListener('pushstate', onLocationChange as EventListener);
			window.removeEventListener('replacestate', onLocationChange as EventListener);
		};
	});

	const searchStore = derived(searchStringStore, ($search) => new URLSearchParams($search));

	let tempSearchParams: URLSearchParams | undefined;

	const setSearchParams: SetSearchParamsFunction = (nextInit, options) => {
		const currentParams = tempSearchParams || get(searchStore);
		tempSearchParams = new URLSearchParams(typeof nextInit === 'function' ? nextInit(currentParams) : nextInit);

		const currentPath = window.location.pathname;
		const newUrl = currentPath + '?' + tempSearchParams.toString();

		if (options?.replace) {
			window.history.replaceState(options.state, '', newUrl);
			window.dispatchEvent(new Event('replacestate'));
		} else {
			window.history.pushState(options?.state, '', newUrl);
			window.dispatchEvent(new Event('pushstate'));
		}

		queueMicrotask(() => {
			tempSearchParams = undefined;
		});
	};

	return [searchStore, setSearchParams];
}

// ============================================================================
// Exports Summary
// ============================================================================

/**
 * Usage:
 *
 * ```ts
 * import { createRouter } from './standalone';
 *
 * export const router = createRouter({
 *   home: '/',
 *   user: '/users/:id',
 *   post: '/posts/:slug',
 * });
 * ```
 *
 * ```svelte
 * <script>
 *   import { router } from './router';
 *   let page = $derived($router);
 * </script>
 *
 * <a href="/">Home</a>
 * <a href="/users/123">User</a>
 *
 * {#if page?.route === 'home'}
 *   <Home />
 * {:else if page?.route === 'user'}
 *   <User id={page.params.id} />
 * {/if}
 * ```
 */
