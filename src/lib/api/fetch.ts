import { BASE_URL } from '../utils/consts';
import { transformClass } from '../transformers/classTransformer';
import type { ClassData, ResponseListData } from '../types/ClassData';
import type { RaceData } from '../types/RaceData';

export async function fetcher<T>(path: string, signal?: AbortSignal): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, { signal });
	return (await res.json()) as T;
}

export async function fetchClasses(path: string, signal?: AbortSignal) {
	const raw = await fetcher<ResponseListData<ClassData>>(path, signal);
	return raw.results.map(transformClass);
}

export async function fetchRaces(path: string, signal?: AbortSignal) {
	const raw = await fetcher<ResponseListData<RaceData>>(path, signal);
	return raw.results;
}
