/**
 * Example: Using the standalone router in your project
 *
 * 1. Copy standalone.ts to your project (e.g., src/lib/router.ts)
 * 2. Create your routes file like this
 * 3. Import and use in your components
 */

// ============================================================================
// Step 1: Define your routes (e.g., src/routes.ts)
// ============================================================================

// import { createRouter } from './standalone'; // or wherever you put it

// export const router = createRouter({
// 	// Basic routes
// 	home: '/',
// 	about: '/about',
// 	contact: '/contact',

// 	// Dynamic params
// 	user: '/users/:id',
// 	post: '/blog/:slug',

// 	// Nested params
// 	article: '/blog/:category/:slug',

// 	// Optional params
// 	search: '/search/:query?'
// });

// ============================================================================
// Step 2: Use in your main app (e.g., src/App.svelte)
// ============================================================================

/*
<script lang="ts">
  import { router } from './routes';
  import { browserLocation } from './standalone';
  
  // Subscribe to router state
  let page = $derived($router);
  
  // Get actual path (even for 404s)
  const [location] = browserLocation();
  let currentPath = $derived($location);
</script>

<nav>
  <a href="/">Home</a>
  <a href="/about" class:active={page?.route === "about"}>About</a>
  <a href="/contact">Contact</a>
  <a href="/users/123">User Profile</a>
</nav>

<main>
  <p>Current path: {currentPath}</p>
  
  {#if !page}
    <h1>404 - Page Not Found</h1>
    <p>The path {currentPath} doesn't exist.</p>
    <button onclick={() => router.open("/")}>Go Home</button>
  {:else if page.route === "home"}
    <h1>Home</h1>
    <button onclick={() => router.open("about")}>Visit About</button>
  {:else if page.route === "about"}
    <h1>About</h1>
    <p>This is the about page</p>
  {:else if page.route === "user"}
    <h1>User Profile</h1>
    <p>User ID: {page.params.id}</p>
    <a href={router.getPath("user", { id: "456" })}>Visit User 456</a>
  {:else if page.route === "article"}
    <h1>{page.params.category} / {page.params.slug}</h1>
    <p>Category: {page.params.category}</p>
    <p>Slug: {page.params.slug}</p>
  {/if}
</main>
*/

// ============================================================================
// Step 3: Advanced - Search params (optional)
// ============================================================================

/*
<script lang="ts">
  import { router } from './routes';
  import { createSearchParams } from './standalone';
  
  let page = $derived($router);
  
  // Search params
  const [searchParams, setSearchParams] = createSearchParams();
  let currentPage = $derived($searchParams.get('page') || '1');
  let filter = $derived($searchParams.get('filter') || 'all');
  
  function nextPage() {
    setSearchParams({ page: String(Number(currentPage) + 1), filter });
  }
</script>

<p>Current page: {currentPage}</p>
<p>Filter: {filter}</p>

<button onclick={nextPage}>Next Page</button>
<button onclick={() => setSearchParams({ page: '1', filter: 'active' })}>
  Show Active (Page 1)
</button>
*/

// ============================================================================
// Step 4: Configuration (optional)
// ============================================================================

/*
// Hash routing (e.g., #/home instead of /home)
export const router = createRouter(
  { home: '/', about: '/about' },
  { hash: true }
);

// Base path (e.g., /app/home instead of /home)
export const router = createRouter(
  { home: '/', about: '/about' },
  { base: '/app' }
);

// Disable automatic link interception
export const router = createRouter(
  { home: '/', about: '/about' },
  { links: false }
);
*/

// ============================================================================
// That's it!
// ============================================================================

/**
 * Total setup:
 * 1. Copy standalone.ts to your project
 * 2. Create routes.ts with createRouter()
 * 3. Import router in main.ts (optional, for link interception)
 * 4. Use $router in your components
 *
 * No build config, no plugins, no magic. Just works. 🎉
 */
