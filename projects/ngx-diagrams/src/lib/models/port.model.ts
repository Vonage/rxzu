import { BaseModel } from './base.model';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { DestroyOptions } from '../interfaces';

export class PortModel extends BaseModel<NodeModel> {
	private name: string;
	private links$: BehaviorSubject<{ [id: string]: LinkModel }>;
	private maximumLinks: number;
	private linkType: string;

	private x$: BehaviorSubject<number>;
	private y$: BehaviorSubject<number>;
	private magnetic$: BehaviorSubject<boolean>;
	private width$: BehaviorSubject<number>;
	private height$: BehaviorSubject<number>;
	private canCreateLinks$: BehaviorSubject<boolean>;

	constructor(name: string, type?: string, id?: string, maximumLinks?: number, linkType?: string, magnetic: boolean = true) {
		super(type, id);
		this.name = name;
		this.magnetic$ = new BehaviorSubject(magnetic);
		this.links$ = new BehaviorSubject({});
		this.maximumLinks = maximumLinks;
		this.x$ = new BehaviorSubject(0);
		this.y$ = new BehaviorSubject(0);
		this.height$ = new BehaviorSubject(0);
		this.width$ = new BehaviorSubject(0);
		this.canCreateLinks$ = new BehaviorSubject(true);
		this.linkType = linkType;
	}

	getNode() {
		return this.getParent();
	}

	getName() {
		return this.name;
	}

	getCanCreateLinks() {
		return this.canCreateLinks$.getValue();
	}

	getCoords() {
		return { x: this.getX(), y: this.getY() };
	}

	selectCanCreateLinks() {
		return this.canCreateLinks$.asObservable();
	}

	setCanCreateLinks(value: boolean) {
		this.canCreateLinks$.next(value);
	}

	getMagnetic() {
		return this.magnetic$.getValue();
	}

	selectMagnetic() {
		return this.magnetic$.asObservable();
	}

	setMagnetic(magnetic: boolean) {
		this.magnetic$.next(magnetic);
	}

	selectX(): Observable<number> {
		return this.x$.asObservable();
	}

	selectY(): Observable<number> {
		return this.y$.asObservable();
	}

	getY() {
		return this.y$.getValue();
	}

	getX() {
		return this.x$.getValue();
	}

	getHeight() {
		return this.height$.getValue();
	}

	getWidth() {
		return this.width$.getValue();
	}

	getMaximumLinks(): number {
		return this.maximumLinks;
	}

	setMaximumLinks(maximumLinks: number) {
		this.maximumLinks = maximumLinks;
	}

	getLinkType() {
		return this.linkType;
	}

	setLinkType(type: string) {
		this.linkType = type;
	}

	removeLink(link: LinkModel) {
		const links = this.links$.getValue();
		delete links[link.id];
		this.links$.next({ ...links });
	}

	addLink(link: LinkModel) {
		this.links$.next({ ...this.links$.value, [link.id]: link });
	}

	getLinks(): { [id: string]: LinkModel } {
		return this.links$.getValue();
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
		return super.getLocked();
	}

	destroy(options?: DestroyOptions) {
		super.destroy(options);

		Object.values(this.getLinks()).forEach(link => {
			link.destroy();
		});
	}

	public createLinkModel(): LinkModel | null {
		const numberOfLinks: number = Object.keys(this.links$.getValue()).length;
		if (this.maximumLinks === 1 && numberOfLinks >= 1) {
			const linkToRemove = Object.values(this.links$.getValue())[0];
			if (linkToRemove) {
				linkToRemove.destroy();
			}
			return null;
		} else if (numberOfLinks >= this.maximumLinks) {
			// for the moment we will remove the first link by default
			const linkToRemove = Object.values(this.links$.getValue())[0];
			if (linkToRemove) {
				linkToRemove.destroy();
			}
			return null;
		}
		return null;
	}
}
