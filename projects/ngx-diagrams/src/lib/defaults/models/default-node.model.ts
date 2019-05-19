import { NodeModel } from '../../models/node.model';
import { DefaultPortModel } from './default-port.model';
import { Observable } from 'rxjs';

export class DefaultNodeModel extends NodeModel {
	name: string;
	color: string;
	height$: Observable<number>;
	width$: Observable<number>;

	constructor(name: string = 'Untitled', color: string = 'rgb(0, 192, 255)') {
		super('default');
		this.name = name;
		this.color = color;
		this.height$ = this.selectHeight();
		this.width$ = this.selectWidth();
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
