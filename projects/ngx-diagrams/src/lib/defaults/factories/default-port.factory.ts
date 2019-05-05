import { AbstractPortFactory } from '../../factories/port.factory';
import { DefaultPortModel } from '../models/default-port.model';

export class DefaultPortFactory extends AbstractPortFactory<DefaultPortModel> {
	constructor() {
		super('default');
	}

	getNewInstance(initialConfig?: any): DefaultPortModel {
		return new DefaultPortModel(true, 'unknown', ...initialConfig);
	}
}
