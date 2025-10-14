import type { Character } from '../types/Character';

export const character = $state<Character>({
	class: null,
	race: null,
	ability_scores: {
		cha: 8,
		con: 8,
		dex: 8,
		int: 8,
		str: 8,
		wis: 8
	},
	AC: 10,
	ACModifier: '',
	armor: [''],
	hit_die: 8,
	hp_at_level_one: 8,
	level: 1,
	name: '',
	saving_throws: [''],
	skills: [''],
	speed: 30,
	weapons: ['']
});
