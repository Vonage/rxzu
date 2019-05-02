import { BaseModel } from '../models/base.model';

export abstract class AbstractFactory<T extends BaseModel> {
    type: string;

    constructor(name: string) {
        this.type = name;
    }

    getType(): string {
        return this.type;
    }
}
