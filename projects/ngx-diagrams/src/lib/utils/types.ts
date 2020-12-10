import { ID } from './tool-kit.util';

export interface HashMap<T> {
	[key: string]: T;
}

export type Entries<T> = (readonly [string, T])[];

export class TypedMap<T> extends Map<ID, T> {
	valuesArray(): T[] {
		return Array.from(this.values());
	}
}
