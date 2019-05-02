import { BaseModel } from './base.model';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BehaviorSubject } from 'rxjs';

export class PortModel extends BaseModel<NodeModel> {
    name: string;
    links$: BehaviorSubject<{ [id: string]: LinkModel }>;
    maximumLinks: number;

    x: number;
    y: number;
    width: number;
    height: number;

    constructor(name: string, type?: string, id?: string, maximumLinks?: number) {
        super(type, id);
        this.name = name;
        this.links$ = new BehaviorSubject({});
        this.maximumLinks = maximumLinks;
    }

    getNode() {
        return this.getParent();
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
        const links = this.links$.getValue();
        delete links[link.getID()];
        this.links$.next({ ...links });
    }

    addLink(link: LinkModel) {
        this.links$.next({ ...this.links$.getValue(), [link.getID()]: link });
    }

    getLinks(): BehaviorSubject<{ [id: string]: LinkModel }> {
        return this.links$;
    }

    updateCoords({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    canLinkToPort(port: PortModel): boolean {
        return true;
    }

    isLocked() {
        return super.isLocked() || this.getParent().getValue().isLocked();
    }


}
