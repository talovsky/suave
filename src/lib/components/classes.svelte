<script lang="ts">
	import { classes } from '../api/fetch';
	import ClassCard from './class-card.svelte';
	const classs = $derived($classes.data);
</script>

<div>Classes</div>

{#each classs as classData}
	<ClassCard {classData} />
{/each}
