import { BaseModel } from './base.model';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay, takeUntil } from 'rxjs/operators';

export class PortModel extends BaseModel<NodeModel> {
	// TODO: convert all primitives to subjects
	private name: string;
	private maximumLinks: number;
	private linkType: string;

	private _links$: BehaviorSubject<{ [id: string]: LinkModel }> = new BehaviorSubject({});
	private _x$: BehaviorSubject<number> = new BehaviorSubject(0);
	private _y$: BehaviorSubject<number> = new BehaviorSubject(0);
	private _magnetic$: BehaviorSubject<boolean> = new BehaviorSubject(true);
	private _width$: BehaviorSubject<number> = new BehaviorSubject(0);
	private _height$: BehaviorSubject<number> = new BehaviorSubject(0);
	private _canCreateLinks$: BehaviorSubject<boolean> = new BehaviorSubject(true);

	private links$: Observable<{ [id: string]: LinkModel }> = this._links$.pipe(
		takeUntil(this.onEntityDestroy()),
		distinctUntilChanged(),
		shareReplay(1)
	);
	private x$: Observable<number> = this._x$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));
	private y$: Observable<number> = this._y$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));
	private magnetic$: Observable<boolean> = this._magnetic$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));

	constructor(name: string, type?: string, id?: string, maximumLinks?: number, linkType?: string, magnetic: boolean = true) {
		super(type, id);
		this.name = name;
		this.maximumLinks = maximumLinks;
		this.linkType = linkType;
		this.setMagnetic(magnetic);
	}

	serialize() {
		return {
			...super.serialize(),
			name: this.getName(),
			linkType: this.getLinkType(),
			maximumLinks: this.getMaximumLinks(),
			type: this.getType(),
			magnetic: this.getMagnetic(),
			height: this.getHeight(),
			width: this.getWidth(),
			canCreateLinks: this.getCanCreateLinks(),
			...this.getCoords(),
		};
	}

	getNode() {
		return this.getParent();
	}

	getName() {
		return this.name;
	}

	getCanCreateLinks(): boolean {
		const numberOfLinks: number = Object.keys(this._links$.getValue()).length;

		if (this.maximumLinks && numberOfLinks >= this.maximumLinks) {
			return false;
		}

		return this._canCreateLinks$.getValue();
	}

	getCoords() {
		return { x: this.getX(), y: this.getY() };
	}

	selectCanCreateLinks() {
		return this._canCreateLinks$;
	}

	setCanCreateLinks(value: boolean) {
		this._canCreateLinks$.next(value);
	}

	getMagnetic() {
		return this._magnetic$.getValue();
	}

	selectMagnetic() {
		return this.magnetic$;
	}

	setMagnetic(magnetic: boolean) {
		this._magnetic$.next(magnetic);
	}

	selectX(): Observable<number> {
		return this.x$;
	}

	selectY(): Observable<number> {
		return this.y$;
	}

	getY() {
		return this._y$.getValue();
	}

	getX() {
		return this._x$.getValue();
	}

	getHeight() {
		return this._height$.getValue();
	}

	getWidth() {
		return this._width$.getValue();
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
		const links = this._links$.getValue();
		delete links[link.id];
		this._links$.next({ ...links });
	}

	addLink(link: LinkModel) {
		this._links$.next({ ...this._links$.value, [link.id]: link });
	}

	getLinks(): { [id: string]: LinkModel } {
		return this._links$.getValue();
	}

	selectLinks(): Observable<{ [id: string]: LinkModel }> {
		return this.links$;
	}

	updateCoords({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
		this._x$.next(x);
		this._y$.next(y);
		this._width$.next(width);
		this._height$.next(height);
	}

	canLinkToPort(port: PortModel): boolean {
		return true;
	}

	isLocked() {
		return super.getLocked();
	}

	createLinkModel() {
		if (this.getCanCreateLinks()) {
			return new LinkModel();
		}
	}

	destroy() {
		super.destroy();

		Object.values(this.getLinks()).forEach(link => {
			link.destroy();
		});
	}
}
