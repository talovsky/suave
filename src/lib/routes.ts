import { createRouter } from './router'; // or wherever you put it

export const router = createRouter({
	home: '/',
	page: '/page',
	page2: '/page2',
	person: '/people/:name'
});
