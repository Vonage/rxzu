import { PortModel } from '../../models/port.model';
import { LinkModel } from '../../models/link.model';
import { DefaultLinkModel } from './default-link.model';

export interface DefaultPortModelConfig {
	id?: string;
	isInput?: boolean;
	name?: string;
	type?: string;
	label?: string;
	linkType?: string;
}

export class DefaultPortModel extends PortModel {
	in: boolean;
	label: string;
	links: { [id: string]: any };

	constructor({
		isInput = true,
		name = 'port',
		type = 'default',
		id = null,
		label = null,
		linkType = 'default'
	}: DefaultPortModelConfig = {}) {
		super(name, type, id, null, linkType);
		this.in = isInput;
		this.label = label || name;
	}

	link(port: PortModel): LinkModel {
		const link = this.createLinkModel();
		link.setSourcePort(this);
		link.setTargetPort(port);
		return link;
	}

	canLinkToPort(port: PortModel): boolean {
		if (port instanceof DefaultPortModel) {
			return this.in !== port.in;
		}
		return true;
	}

	createLinkModel(): LinkModel {
		const link = super.createLinkModel();
		return link || new DefaultLinkModel(this.getLinkType());
	}
}
