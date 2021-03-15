import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  createEntityState,
  createValueState,
  EntityState,
  ValueState,
} from '../state';
import { EntityMap, ID, isString } from '../utils';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { NodeModel } from './node.model';
import { Coords, Dimensions, PortModelOptions } from '../interfaces';
import { DiagramEngine } from '../engine.core';

export class PortModel extends BaseModel<NodeModel> {
  protected coords$: ValueState<Coords>;
  protected maximumLinks$: ValueState<number | null>;
  protected linkNamespace$: ValueState<string>;
  protected dimensions$: ValueState<Dimensions>;
  protected magnetic$: ValueState<boolean>;
  protected canCreateLinks$: ValueState<boolean>;
  protected links$: EntityState<LinkModel>;

  constructor(options: PortModelOptions = {}) {
    super({ type: 'port', logPrefix: '[Port]', ...options });

    this.coords$ = createValueState(
      options.coords ?? { x: 0, y: 0 },
      this.entityPipe('coords')
    );

    this.maximumLinks$ = createValueState(
      options.maximumLinks ?? null,
      this.entityPipe('maximumLinks')
    );

    this.linkNamespace$ = createValueState(
      options.linkNamespace ?? 'default',
      this.entityPipe('linkName')
    );

    this.magnetic$ = createValueState<boolean>(
      true,
      this.entityPipe('magnetic')
    );

    this.dimensions$ = createValueState(
      options.dimensions ?? { width: 0, height: 0 },
      this.entityPipe('dimensions')
    );

    this.canCreateLinks$ = createValueState(
      options.canCreateLinks ?? true,
      this.entityPipe('canCreateLinks')
    );

    this.links$ = createEntityState([], this.entityPipe('links'));
  }

  link(port: PortModel): LinkModel | null {
    if (this.getCanCreateLinks()) {
      const link = new LinkModel({ namespace: this.getLinkNamespace() });
      link.setSourcePort(this);
      link.setTargetPort(port);
      return link;
    }

    return null;
  }

  getNode() {
    return this.getParent();
  }

  getCanCreateLinks(): boolean {
    const numberOfLinks = this.getLinks().size;

    if (this.maximumLinks$.value && numberOfLinks >= this.maximumLinks$.value) {
      return false;
    }

    return this.canCreateLinks$.value;
  }

  selectCoordsAndDimensions() {
    return combineLatest([this.selectCoords(), this.selectDimensions()]).pipe(
      map(([coords, dim]) => ({ ...coords, ...dim }))
    );
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

  selectCoords(): Observable<Coords> {
    return this.coords$.value$;
  }

  getCoords() {
    return this.coords$.value;
  }

  getDimensions() {
    return this.dimensions$.value;
  }

  selectDimensions() {
    return this.dimensions$.select();
  }

  getMaximumLinks(): number | null {
    return this.maximumLinks$.value;
  }

  setMaximumLinks(maximumLinks?: number) {
    this.maximumLinks$.set(maximumLinks ?? null).emit();
  }

  getLinkNamespace() {
    return this.linkNamespace$.value;
  }

  setLinkNamespace(type: string) {
    this.linkNamespace$.set(type).emit();
  }

  removeLink(linkOrId?: ID | LinkModel | null) {
    if (linkOrId) {
      const linkId = isString(linkOrId) ? linkOrId : linkOrId?.id;
      this.links$.remove(linkId, false).emit();
    }
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

  updateCoords(
    {
      x,
      y,
      width,
      height,
    }: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    engine?: DiagramEngine
  ) {
    this.coords$.set({ x, y }).emit();
    this.dimensions$.set({ width, height }).emit();

    if (!engine) {
      this.log(`Couldn't find DiagramEngine when updating coords. skipping`);
      return;
    }

    this.getLinksArray().forEach((link) => {
      const relCoords = engine.getCanvasManager().getPortCenter(this);
      const point = link.getPointForPort(this);
      point && point.setCoords({ ...relCoords });
    });
  }

  canLinkToPort(port?: PortModel | null): boolean {
    return true;
  }

  isLocked() {
    return super.getLocked();
  }

  createLinkModel(): LinkModel | undefined {
    if (this.getCanCreateLinks()) {
      return new LinkModel({
        parent: this.getParent().getParent(),
        namespace: this.getLinkNamespace(),
      });
    }
    return undefined;
  }

  destroy() {
    super.destroy();
    this.links$.clear().emit();
  }
}
