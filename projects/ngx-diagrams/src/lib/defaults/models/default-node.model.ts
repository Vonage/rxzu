import { NodeModel } from '../../models/node.model';
import { DefaultPortModel } from './default-port.model';
import { Observable } from 'rxjs';

export class DefaultNodeModel extends NodeModel {
	name: string;
	color: string;
	height$: Observable<number>;
	width$: Observable<number>;

	constructor(name: string = 'Untitled', type: string = 'default', color: string = 'rgb(0, 192, 255)') {
		super(type);
		this.name = name;
		this.color = color;
		this.height$ = this.selectHeight();
		this.width$ = this.selectWidth();
	}

	addInPort(name: string, type: string = 'default') {
		const port = new DefaultPortModel(true, name, type);
		this.addPort(port);
		return port;
	}

	addOutPort(name: string, type: string = 'default') {
		const port = new DefaultPortModel(false, name, type);
		this.addPort(port);
		return port;
	}
}
