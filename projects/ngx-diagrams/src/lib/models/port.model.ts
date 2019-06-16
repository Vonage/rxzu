import { BaseModel, BaseModelState } from './base.model';
import { LinkModel } from './link.model';
import { Coords } from '../interfaces/coords.interface';
import { Dimensions } from '../interfaces/dimensions.interface';
import { ID } from '../interfaces/types';

export type PortModelState<S = any> = BaseModelState<S> & {
	coords: Coords;
	dimensions: Dimensions;
	linkIds: ID[];
	maxLinks: number;
	io: 'in' | 'out';
};

const DEFAULT_STATE: PortModelState = {
	coords: { x: 0, y: 0 },
	dimensions: { width: 0, height: 0 },
	linkIds: [],
	maxLinks: null,
	io: 'in'
};

export class PortModel<S = any> extends BaseModel<PortModelState<S>> {
	private name: string;

	constructor(name: string, type?: string, id?: string, initialState?: Partial<PortModelState<S>>) {
		super(type, id, { ...DEFAULT_STATE, ...initialState });
		this.name = name;
	}

	getName() {
		return this.name;
	}

	removeLink(linkId: ID) {
		const { linkIds } = this.get();
		const idx = linkIds.indexOf(linkId);
		this.update({ linkIds: linkIds.splice(idx, 1) } as Partial<PortModelState<S>>);
	}

	addLink(linkId: ID) {
		this.update({ linkIds: [...this.get('linkIds'), linkId] } as Partial<PortModelState<S>>);
	}

	canLinkToPort(port: PortModel): boolean {
		return true;
	}

	getLinkIds(): ID[] {
		return this.get('linkIds');
	}

	public createLinkModel(): LinkModel | null {
		const numberOfLinks = this.get('linkIds').length;
		if (this.get('maxLinks') === 1 && numberOfLinks >= 1) {
			// TODO: should be done in diagramModel as it is the parent of all links
			// return Object.values(this.links$.getValue())[0][0];
		} else if (numberOfLinks >= this.get('maxLinks')) {
			return null;
		}
		return null;
	}
}
