import type { SkillChoice } from './Api';

export type ClassIndex =
	| 'barbarian'
	| 'bard'
	| 'rogue'
	| 'ranger'
	| 'wizard'
	| 'sorcerer'
	| 'paladin'
	| 'fighter'
	| 'monk'
	| 'cleric'
	| 'druid'
	| 'warlock';

export interface ResponseListData<T> {
	count: number;
	next: null | string;
	previous: null | string;
	results: T[];
}

export interface ClassData {
	name: string;
	slug: ClassIndex;
	desc: string;
	hit_dice: string;
	hp_at_1st_level: string;
	hp_at_higher_levels: string;
	prof_armor: string;
	prof_weapons: string;
	prof_tools: string;
	prof_saving_throws: string;
	prof_skills: string;
	equipment: string;
	table: string;
	spellcasting_ability: string;
	subtypes_name: string;
	archetypes: {
		name: string;
		slug: string;
		desc: string;
		document__slug: string;
		document__title: string;
		document__license_url: string;
		document__url: string;
	}[];
	document__slug: string;
	document__title: string;
	document__license_url: string;
	document__url: string;
}

export interface CleanClass {
	name: string;
	slug: ClassIndex;
	hitDie: number;
	proficiencies: {
		armor: string[];
		weapons: string[];
		savingThrows: string[];
	};
	skillChoices: SkillChoice | null;
	features: {
		level1: {
			title: string;
			level: number;
			description: string[];
		}[];
		progression: {
			title: string;
			level: number;
			description: string[];
		}[];
	};
	table: string;
	spellcasting_ability: string;
	subtypes_name: string;
	document__slug: string;
	document__title: string;
	document__license_url: string;
	document__url: string;
}
