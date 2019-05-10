import { NodeModel } from '../../models/node.model';

export class DefaultNodeModel extends NodeModel {
	name: string;
	color: string;

	constructor(name: string = 'Untitled', color: string = 'rgb(0, 192, 255)') {
		super('default');
		this.name = name;
		this.color = color;
	}
}
