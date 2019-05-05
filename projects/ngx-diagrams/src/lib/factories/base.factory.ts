import { BaseModel } from '../models/base.model';

export abstract class AbstractFactory<T extends BaseModel> {
	protected _type: string;

	constructor(name: string) {
		this._type = name;
	}

	get type(): string {
		return this._type;
	}

	abstract getNewInstance(initialConfig?: any): T;
}
