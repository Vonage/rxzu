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

	addInPort({ name, type = 'default', id, linkType = 'default' }: { name: string; type?: string; id?: string; linkType?: string }) {
		const port = new DefaultPortModel(true, name, type, id, null, linkType);
		this.addPort(port);
		return port;
	}

	addOutPort({ name, type = 'default', id, linkType = 'default' }: { name: string; type?: string; id?: string; linkType?: string }) {
		const port = new DefaultPortModel(false, name, type, id, null, linkType);
		this.addPort(port);
		return port;
	}
}
