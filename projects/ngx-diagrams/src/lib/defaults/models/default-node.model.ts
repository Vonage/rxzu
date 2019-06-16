import { NodeModel } from '../../models/node.model';
import { DefaultPortModel } from './default-port.model';
import { Observable } from 'rxjs';
import { Dimensions } from '../../interfaces/dimensions.interface';

export class DefaultNodeModel extends NodeModel {
	name: string;
	color: string;
	dimensions$: Observable<Dimensions>;

	constructor(name: string = 'Untitled', color: string = 'rgb(0, 192, 255)') {
		super('default');
		this.name = name;
		this.color = color;
		this.dimensions$ = this.select(s => s.dimensions);
	}

	addInPort(name: string) {
		const port = new DefaultPortModel(true, name);
		this.addPort(port);
		return port;
	}

	addOutPort(name: string) {
		const port = new DefaultPortModel(false, name);
		this.addPort(port);
		return port;
	}
}
