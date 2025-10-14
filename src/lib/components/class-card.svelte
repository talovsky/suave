<script lang="ts">
	import type { CleanClass } from '../types/ClassData';
	import { character } from '../stores/character.svelte';

	let { classData }: { classData: CleanClass } = $props();

	function selectClass() {
		character.class = classData.slug;
		character.hit_die = classData.hitDie;
		character.armor = classData.proficiencies.armor;
		character.weapons = classData.proficiencies.weapons;
		character.saving_throws = classData.proficiencies.savingThrows;
	}
</script>

<div class:active={character.class === classData.slug}>
	<h3>{classData.name}</h3>
	<button onclick={selectClass}>Select</button>
</div>

<style>
	h3 {
		font-family: 'Karla Variable', 'SF Pro', 'Avenir', system-ui, sans-serif;
		font-family: 'Crimson Pro Variable', 'Georgia', serif;
	}

	.active {
		background: red;
	}
</style>
