import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay, takeUntil } from 'rxjs/operators';
import { HashMap } from '../utils/types';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { NodeModel } from './node.model';

export class PortModel extends BaseModel<NodeModel> {
	// TODO: convert all primitives to subjects
	protected name: string;
	protected maximumLinks: number;
	protected linkType: string;

	protected _links$ = new BehaviorSubject<HashMap<LinkModel>>({});
	protected _x$ = new BehaviorSubject(0);
	protected _y$ = new BehaviorSubject(0);
	protected _magnetic$ = new BehaviorSubject(true);
	protected _width$ = new BehaviorSubject(0);
	protected _height$ = new BehaviorSubject(0);
	protected _canCreateLinks$ = new BehaviorSubject(true);

	protected links$ = this._links$.asObservable().pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));
	protected x$ = this._x$.pipe(this.entityPipe('x'));
	protected y$ = this._y$.pipe(this.entityPipe('y'));
	protected magnetic$ = this._magnetic$.pipe(this.entityPipe('magnetic'));

	constructor(
		name: string,
		type?: string,
		id?: string,
		maximumLinks?: number,
		linkType?: string,
		magnetic: boolean = true,
		logPrefix: string = '[Port]'
	) {
		super(type, id, logPrefix);
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

	getLinks(): HashMap<LinkModel> {
		return this._links$.getValue();
	}

	selectLinks(): Observable<HashMap<LinkModel>> {
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
