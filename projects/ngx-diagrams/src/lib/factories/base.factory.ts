import { BaseModel } from '../models/base.model';

export abstract class AbstractFactory<T extends BaseModel> {
	type: string;

	constructor(name: string) {
		this.type = name;
	}

	get type(): string {
		return this.type;
	}

	abstract getNewInstance(initialConfig?: any): T;
}
