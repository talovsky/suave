/**
 * load - Simple async data loading for Svelte 5
 *
 * The dumbest data loader:
 * - Load on mount
 * - Abort on unmount/reload
 * - Loading/error/data states
 *
 * No caching, no deduplication.
 */

import { readable, type Readable } from 'svelte/store';

export interface LoadState<T> {
	data: T | undefined;
	error: Error | undefined;
	loading: boolean;
}

export interface Load<T> extends Readable<LoadState<T>> {
	reload: () => void;
	cancel: () => void;
}

/**
 * Load data asynchronously with loading/error states.
 *
 * Automatically cancels request when component unmounts (last subscriber unsubscribes).
 * Automatically parses Response objects (from fetch API) as JSON.
 *
 * @example
 * ```ts
 * // Simple - auto-parses JSON
 * const user = load((signal) =>
 *   fetch('/api/user', { signal })
 * );
 *
 * // Or with manual parsing
 * const user = load((signal) =>
 *   fetch('/api/user', { signal }).then(r => r.json())
 * );
 *
 * let data = $derived($user.data);
 * let loading = $derived($user.loading);
 * let error = $derived($user.error);
 *
 * // Manual reload
 * user.reload();
 *
 * // Manual cancel (e.g., Cancel button)
 * user.cancel();
 * ```
 */
export function load<T>(fetcher: (signal: AbortSignal) => Promise<T | Response>): Load<T> {
	let controller: AbortController | null = null;
	let currentState: LoadState<T> = {
		data: undefined,
		error: undefined,
		loading: true
	};

	let setValue: ((value: LoadState<T>) => void) | null = null;

	async function fetchData() {
		// Abort previous request
		if (controller) {
			controller.abort();
		}

		// Create new controller
		controller = new AbortController();
		const currentController = controller;

		// Only update to loading if we're not already loading
		// This prevents redundant updates on initial mount
		if (!currentState.loading || currentState.error) {
			currentState = { ...currentState, error: undefined, loading: true };
			setValue?.(currentState);
		}

		try {
			let data = await fetcher(currentController.signal);

			// Ignore if aborted
			if (currentController.signal.aborted) {
				return;
			}

			// Auto-parse Response objects (fetch API)
			if (data instanceof Response) {
				data = await data.json();

				// Check again after parsing (component might have unmounted)
				if (currentController.signal.aborted) {
					return;
				}
			}

			// Success!
			currentState = {
				data: data as T,
				error: undefined,
				loading: false
			};
			setValue?.(currentState);
		} catch (error) {
			// Ignore if aborted
			if (currentController.signal.aborted) {
				return;
			}

			// Error!
			const err = error instanceof Error ? error : new Error(String(error));
			currentState = {
				...currentState,
				error: err,
				loading: false
			};
			setValue?.(currentState);
		}
	}

	function cancel() {
		if (controller) {
			controller.abort();
			controller = null;
		}
	}

	const store = readable<LoadState<T>>(currentState, (set) => {
		setValue = set;

		// Load on first subscriber (this only runs when going from 0→1 subscribers)
		setTimeout(fetchData, 0);

		// Cleanup when last subscriber unsubscribes (this only runs when going from 1→0)
		return () => {
			cancel();
			setValue = null;
		};
	});

	return {
		subscribe: store.subscribe,
		reload: fetchData,
		cancel // Also available for manual cancellation
	};
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Basic (auto-parses JSON):
 *
 * ```ts
 * const user = load((signal) =>
 *   fetch('/api/user', { signal })
 * );
 *
 * let data = $derived($user.data);
 * let loading = $derived($user.loading);
 * let error = $derived($user.error);
 * ```
 *
 * With Parameters (use closures):
 *
 * ```ts
 * let userId = $state('123');
 *
 * const user = load((signal) =>
 *   fetch(`/api/users/${userId}`, { signal })
 * );
 *
 * // To reload when userId changes, call reload manually:
 * $effect(() => {
 *   userId; // Track dependency
 *   user.reload();
 * });
 * ```
 *
 * Or just recreate on change:
 *
 * ```ts
 * let userId = $state('123');
 *
 * let user = $derived(load((signal) =>
 *   fetch(`/api/users/${userId}`, { signal })
 * ));
 *
 * // Recreates (and reloads) when userId changes!
 * let data = $derived($user.data);
 * ```
 *
 * Custom parsing (non-JSON responses):
 *
 * ```ts
 * const text = load((signal) =>
 *   fetch('/api/text', { signal }).then(r => r.text())
 * );
 *
 * const blob = load((signal) =>
 *   fetch('/api/image', { signal }).then(r => r.blob())
 * );
 * ```
 */
