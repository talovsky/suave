import type { ClassIndex } from './ClassData';

export type AbilityScore = 'dex' | 'str' | 'wis' | 'int' | 'cha' | 'con';

export interface CharacterType {
	name: string;
	level: number;
	class: ClassIndex | null;
	ability_scores: Record<AbilityScore, number>;
	hp_at_level_one: number;
	hit_die: number;
	AC: number;
	ACModifier: string;
	speed: number;
	race: string;
	skills: string[];
	armor: string[];
	weapons: string[];
	saving_throws: string[];
}
