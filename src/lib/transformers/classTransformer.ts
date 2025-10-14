import { marked } from 'marked';
import type { Section, SkillChoice } from '../types/Api';
import type { ClassData, CleanClass } from '../types/ClassData';

export function transformClass(raw: ClassData): CleanClass {
	const features = parseFeatures(raw.desc);
	const { level1, progression } = categorizeByLevel(features);

	const table = raw.table.replace(/Proficiency Bonus/g, 'Prof. Bonus');

	const obj: CleanClass = {
		name: raw.name,
		slug: raw.slug,
		hitDie: parseInt(raw.hit_dice.replace('1d', ''), 10),
		proficiencies: {
			armor: raw.prof_armor
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			weapons: raw.prof_weapons
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			savingThrows: raw.prof_saving_throws
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		},
		skillChoices: parseSkillChoices(raw.prof_skills),
		features: {
			level1: level1.map((s) => ({
				title: s.title,
				level: 1,
				description: s.content
			})),
			progression: progression.map((s) => ({
				title: s.title,
				level: s.level, // already extracted!
				description: s.content
			}))
		},
		table: marked.parse(table) as string,
		spellcasting_ability: raw.spellcasting_ability,
		subtypes_name: raw.subtypes_name,
		document__license_url: raw.document__license_url,
		document__slug: raw.document__slug,
		document__title: raw.document__title,
		document__url: raw.document__url
	};

	return obj;
}

function parseFeatures(md: string) {
	const html = marked.parse(md) as string;
	const parser = new DOMParser();
	const { body } = parser.parseFromString(html, 'text/html');

	const features: Section[] = [];
	let curr: { title: string; elements: Element[] } | null = null;

	for (const node of body.children) {
		if (node.tagName === 'H3') {
			if (curr) {
				features.push({
					title: curr.title,
					content: curr.elements.map((el) => el.outerHTML)
				});
			}
			curr = { title: node.textContent || '', elements: [] };
		} else if (curr) {
			curr.elements.push(node);
		}
	}
	if (curr) {
		features.push({
			title: curr.title,
			content: curr.elements.map((el) => el.outerHTML)
		});
	}

	return features;
}

function categorizeByLevel(sections: Section[]) {
	const level1: Section[] = [];
	const progression: (Section & { level: number })[] = [];

	for (const section of sections) {
		const level = extractLevel(section);

		if (level === 1) {
			level1.push(section);
		} else {
			progression.push({ ...section, level });
		}
	}

	return { level1, progression };
}

export function parseSkillChoices(text: string): SkillChoice | null {
	const match = text.match(/Choose (\w+) from (.+)/i);

	if (!match) return null;

	const chooseCount = parseChooseCount(match[1] ?? [match[2]]); // "two" -> 2
	const skillsText = match[2];

	const skills = skillsText
		.split(/,| and /)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	return {
		choose: chooseCount,
		from: skills
	};
}

function parseChooseCount(word: string): number {
	const numbers: Record<string, number> = {
		one: 1,
		two: 2,
		three: 3,
		four: 4,
		five: 5
	};

	return numbers[word.toLowerCase()] || parseInt(word, 10);
}

function extractLevel(feature: Section): number {
	const firstContent = feature.content[0] || '';
	const parser = new DOMParser();
	const doc = parser.parseFromString(firstContent, 'text/html');
	const firstSentence = doc.body.textContent?.split('.')[0] || '';

	const searchText = `${feature.title} ${firstSentence}`;
	const match = searchText.match(
		/(?:at|starting at|beginning at|beginning when you reach|when you reach|by)\s+(\d+)(?:st|nd|rd|th)\s+level/i
	);

	return match ? parseInt(match[1], 10) : 1;
}
