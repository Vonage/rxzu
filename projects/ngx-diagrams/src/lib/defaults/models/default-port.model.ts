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
	maximumLinks?: number;
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
		linkType = 'default',
		maximumLinks = null,
	}: DefaultPortModelConfig = {}) {
		super(name, type, id, null, linkType);
		this.in = isInput;
		this.label = label || name;

		if (this.in) {
			this.setCanCreateLinks(false);
		} else {
			this.setMaximumLinks(maximumLinks);
			this.setMagnetic(false);
		}
	}

	link(port: PortModel): LinkModel {
		if (super.getCanCreateLinks()) {
			console.log(port.getLinkType());
			const link = new DefaultLinkModel(this.getLinkType());
			link.setSourcePort(this);
			link.setTargetPort(port);
			return link;
		}

		return null;
	}

	createLinkModel() {
		if (super.getCanCreateLinks()) {
			return new DefaultLinkModel(this.getLinkType());
		}
	}

	canLinkToPort(port: PortModel): boolean {
		if (port instanceof DefaultPortModel) {
			return this.in !== port.in;
		}
		return true;
	}
}
