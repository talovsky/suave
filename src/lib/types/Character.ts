import type { ClassIndex } from './ClassData';

export type AbilityScore = 'dex' | 'str' | 'wis' | 'int' | 'cha' | 'con';

export interface AbilityScores {
	dex: number;
	str: number;
	wis: number;
	int: number;
	cha: number;
	con: number;
}

export interface Character {
	name: string;
	level: number;
	class: ClassIndex | null;
	ability_scores: AbilityScores;
	hp_at_level_one: number;
	hit_die: number;
	AC: number;
	ACModifier: string;
	speed: number;
	race: string | null;
	skills: string[];
	armor: string[];
	weapons: string[];
	saving_throws: string[];
}
