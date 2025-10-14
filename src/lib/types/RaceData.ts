export interface RaceData {
	name: string;
	slug: string;
	desc: string;
	asi_desc: string;
	asi: {
		attributes: string[];
		value: number;
	}[];
	age: string;
	alignment: string;
	size: string;
	size_raw: string;
	speeed: {
		walk: number;
	};
	speed_desc: string;
	languages: string;
	vision: string;
	traits: string;
	subraces: {
		name: string;
		slug: string;
		desc: string;
		asi: {
			attributes: string[];
			value: number;
		};
		traits: string;
		asi_desc: string;
		document__slug: string;
		document__title: string;
		document__url: string;
	}[];
	document__slug: string;
	document__title: string;
	document__license_url: string;
	document__url: string;
}
