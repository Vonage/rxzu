import { ID } from 'ngx-diagrams';

export interface HashMap<T> {
	[key: string]: T;
}

export class TypedMap<T> extends Map<ID, T> {
	valuesArray(): T[] {
		return Array.from(this.values());
	}
}
