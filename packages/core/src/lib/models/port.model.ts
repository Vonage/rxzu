import { Observable } from 'rxjs';
import { createEntityState, createValueState } from '../state';
import { EntityMap, ID, isString } from '../utils';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { NodeModel } from './node.model';

export class PortModel extends BaseModel<NodeModel> {
  // TODO: convert all primitives to subjects
  protected name: string;
  protected maximumLinks: number;
  protected linkType: string;

  protected links$ = createEntityState<LinkModel>([], this.entityPipe('links'));
  protected x$ = createValueState(0, this.entityPipe('x'));
  protected y$ = createValueState(0, this.entityPipe('y'));
  protected width$ = createValueState(0, this.entityPipe('y'));
  protected height$ = createValueState(0, this.entityPipe('y'));
  protected magnetic$ = createValueState(true, this.entityPipe('magnetic'));
  protected canCreateLinks$ = createValueState(true, this.entityPipe('magnetic'));

  constructor(
    name: string,
    type?: string,
    id?: string,
    maximumLinks?: number,
    linkType?: string,
    magnetic = true,
    logPrefix = '[Port]'
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
      ...this.getCoords()
    };
  }

  getNode() {
    return this.getParent();
  }

  getName() {
    return this.name;
  }

  getCanCreateLinks(): boolean {
    const numberOfLinks = this.getLinks().size;

    if (this.maximumLinks && numberOfLinks >= this.maximumLinks) {
      return false;
    }

    return this.canCreateLinks$.value;
  }

  getCoords() {
    return { x: this.getX(), y: this.getY() };
  }

  selectCanCreateLinks(): Observable<boolean> {
    return this.canCreateLinks$.value$;
  }

  setCanCreateLinks(value: boolean) {
    this.canCreateLinks$.set(value).emit();
  }

  getMagnetic(): boolean {
    return this.magnetic$.value;
  }

  selectMagnetic(): Observable<boolean> {
    return this.magnetic$.value$;
  }

  setMagnetic(magnetic: boolean) {
    this.magnetic$.set(magnetic).emit();
  }

  selectX(): Observable<number> {
    return this.x$.value$;
  }

  selectY(): Observable<number> {
    return this.y$.value$;
  }

  getY() {
    return this.y$.value;
  }

  getX() {
    return this.x$.value;
  }

  getHeight() {
    return this.height$.value;
  }

  getWidth() {
    return this.width$.value;
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

  removeLink(linkOrId: ID | LinkModel) {
    const linkId = isString(linkOrId) ? linkOrId : linkOrId.id;
    this.links$.remove(linkId, false).emit();
  }

  addLink(link: LinkModel) {
    this.links$.add(link).emit();
  }

  getLinks(): EntityMap<LinkModel> {
    return this.links$.value;
  }

  getLinksArray(): LinkModel[] {
    return this.links$.array();
  }

  selectLinks(): Observable<EntityMap<LinkModel>> {
    return this.links$.value$;
  }

  updateCoords({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
    this.x$.set(x).emit();
    this.y$.set(y).emit();
    this.width$.set(width).emit();
    this.height$.set(height).emit();
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
    this.links$.clear().emit();
  }
}
