import { BaseModel } from './base.model';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';

export class PortModel extends BaseModel<NodeModel> {
	private name: string;
	private links$: BehaviorSubject<{ [id: string]: LinkModel }>;
	private maximumLinks: number;

	private x$: BehaviorSubject<number>;
	private y$: BehaviorSubject<number>;
	private width$: BehaviorSubject<number>;
	private height$: BehaviorSubject<number>;

	constructor(name: string, type?: string, id?: string, maximumLinks?: number) {
		super(type, id);
		this.name = name;
		this.links$ = new BehaviorSubject({});
		this.maximumLinks = maximumLinks;
		this.x$ = new BehaviorSubject(0);
		this.y$ = new BehaviorSubject(0);
		this.height$ = new BehaviorSubject(0);
		this.width$ = new BehaviorSubject(0);
	}

	getNode() {
		return this.parent;
	}

	getName() {
		return this.name;
	}

	getMaximumLinks(): number {
		return this.maximumLinks;
	}

	setMaximumLinks(maximumLinks: number) {
		this.maximumLinks = maximumLinks;
	}

	removeLink(link: LinkModel) {
		const links = this.links$.value;
		delete links[link.id];
		this.links$.next({ ...links });
	}

	addLink(link: LinkModel) {
		this.links$.next({ ...this.links$.value, [link.id]: link });
	}

	getLinks(): { [id: string]: LinkModel } {
		return this.links$.value;
	}

	selectLinks(): Observable<{ [id: string]: LinkModel }> {
		return this.links$.asObservable();
	}

	updateCoords({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
		this.x$.next(x);
		this.y$.next(y);
		this.width$.next(width);
		this.height$.next(height);
	}

	canLinkToPort(port: PortModel): boolean {
		return true;
	}

	isLocked() {
		// return super.getLocked() || this.get getParent().isLocked();
	}

	public createLinkModel(): LinkModel | null {
		const numberOfLinks: number = Object.keys(this.links$.getValue()).length;
		if (this.maximumLinks === 1 && numberOfLinks >= 1) {
			return Object.values(this.links$.getValue())[0][0];
		} else if (numberOfLinks >= this.maximumLinks) {
			return null;
		}
		return null;
	}
}
