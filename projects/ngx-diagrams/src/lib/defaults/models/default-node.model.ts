import { NodeModel } from '../../models/node.model';
import { DefaultPortModel } from './default-port.model';
import { Observable } from 'rxjs';

export class DefaultNodeModel extends NodeModel {
	name: string;
	color: string;
	height$: Observable<number>;
	width$: Observable<number>;

	constructor(name: string = 'Untitled', type: string = 'default', id?: string, color: string = 'rgb(0, 192, 255)') {
		super(type, id);
		this.name = name;
		this.color = color;
		this.height$ = this.selectHeight();
		this.width$ = this.selectWidth();
	}

	addInPort(name: string, type: string = 'default', id?: string) {
		const port = new DefaultPortModel(true, name, type, id);
		this.addPort(port);
		return port;
	}

	addOutPort(name: string, type: string = 'default', id?: string) {
		const port = new DefaultPortModel(false, name, type, id);
		this.addPort(port);
		return port;
	}
}
