import { Observable } from 'rxjs';
import { BaseEntity, BaseEntityType } from '../base.entity';
import { DiagramEngineCore } from '../engine.core';
import { Coords } from '../interfaces/coords.interface';
import { SelectOptions } from '../interfaces/select-options.interface';
import { SerializedDiagramModel } from '../interfaces/serialization.interface';
import { createEntityState, createValueState } from '../state';
import { coerceArray, ID, isEmptyArray, unique } from '../utils';
import { EntityMap } from '../utils/types';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { NodeModel } from './node.model';
import { PortModel } from './port.model';
import { PointModel } from './point.model';

export class DiagramModel extends BaseEntity {
  protected nodes$ = createEntityState<NodeModel>([], this.entityPipe('nodes'));
  protected links$ = createEntityState<LinkModel>([], this.entityPipe('links'));
  protected offsetX$ = createValueState<number>(0, this.entityPipe('offsetX'));
  protected offsetY$ = createValueState<number>(0, this.entityPipe('offsetY'));
  protected zoom$ = createValueState<number>(100, this.entityPipe('zoom'));
  protected maxZoomOut$ = createValueState<number | null>(
    null,
    this.entityPipe('maxZoomOut')
  );
  protected maxZoomIn$ = createValueState<number | null>(
    null,
    this.entityPipe('maxZoomIn')
  );
  protected gridSize$ = createValueState<number>(
    0,
    this.entityPipe('gridSize')
  );
  protected allowCanvasZoom$ = createValueState<boolean>(
    true,
    this.entityPipe('allowCanvasZoom')
  );
  protected allowCanvasTranslation$ = createValueState<boolean>(
    true,
    this.entityPipe('allowCanvasTranslation')
  );
  protected inverseZoom$ = createValueState<boolean>(
    true,
    this.entityPipe('inverseZoom')
  );
  protected allowLooseLinks$ = createValueState<boolean>(
    true,
    this.entityPipe('allowLooseLinks')
  );
  protected portMagneticRadius$ = createValueState<number>(
    30,
    this.entityPipe('portMagneticRadius')
  );

  constructor(
    protected diagramEngine: DiagramEngineCore,
    id?: string,
    logPrefix = '[Diagram]'
  ) {
    super(id, logPrefix);
  }

  getNodes(): EntityMap<NodeModel> {
    return this.nodes$.value;
  }

  getNodesArray(): NodeModel[] {
    return this.nodes$.array();
  }

  getNode(id?: ID | null): NodeModel | undefined {
    return id && this.nodes$.get(id) || undefined;
  }

  getLink(id?: ID | null): LinkModel | undefined {
    return id && this.links$.get(id) || undefined;
  }

  getLinks(): EntityMap<LinkModel> {
    return this.links$.value;
  }

  getLinksArray(): LinkModel[] {
    return this.links$.array();
  }

  getAllPorts(options: SelectOptions<PortModel> = {}): Map<string, PortModel> {
    const result = new Map<ID, PortModel>();

    this.getNodes().forEach((node) => {
      const ports = options.filter
        ? node.getPortsArray().filter(options.filter)
        : node.getPortsArray();
      ports.forEach((port) => result.set(port.id, port));
    });

    return result;
  }

  /**
   * Add a node to the diagram
   * @returns Inserted Node
   */
  addNode(node: NodeModel): NodeModel {
    this.nodes$.add(node).emit();
    return node;
  }

  /**
   * Delete a node from the diagram
   */
  deleteNode(nodeOrId: NodeModel | string): void {
    const nodeId: ID = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;
    const node = this.getNode(nodeId);
    if (!node) return;

    for (const port of node.getPorts().values()) {
      for (const link of port.getLinks().values()) {
        this.deleteLink(link);
      }
    }

    this.nodes$.remove(nodeId).emit();
  }

  /**
   * Get nodes as observable, use `.getValue()` for snapshot
   */
  selectNodes(): Observable<EntityMap<NodeModel>> {
    return this.nodes$.value$;
  }

  /**
   * Add link
   * @returns Newly created link
   */
  addLink(link: LinkModel): LinkModel {
    this.links$.add(link).emit();
    return link;
  }

  /**
   * Delete link
   */
  deleteLink(linkOrId: LinkModel | string) {
    const linkId: ID = typeof linkOrId === 'string' ? linkOrId : linkOrId.id;
    this.links$.remove(linkId).emit();
  }

  reset() {
    this.nodes$.clear().emit();
    this.links$.clear().emit();
  }

  /**
   * Get links behaviour subject, use `.getValue()` for snapshot
   */
  selectLinks(): Observable<EntityMap<LinkModel>> {
    return this.links$.value$;
  }

  // /**
  //  * Serialize the diagram model to JSON
  //  * @returns diagram model as a string
  //  */
  serialize(): SerializedDiagramModel {
    const serializedNodes = this.nodes$.map((node) => node.serialize());
    const serializedLinks = this.links$.map((link) => link.serialize());

    return {
      ...super.serialize(),
      nodes: serializedNodes,
      links: serializedLinks,
    };
  }

  setPortMagneticRadius(portMagneticRadius: number) {
    this.portMagneticRadius$.set(portMagneticRadius).emit();
  }

  getPortMagneticRadius() {
    return this.portMagneticRadius$.value;
  }

  selectPortMagneticRadius() {
    return this.portMagneticRadius$.select();
  }

  setAllowLooseLinks(allowLooseLinks: boolean) {
    this.allowLooseLinks$.set(allowLooseLinks).emit();
  }

  getAllowLooseLinks() {
    return this.allowLooseLinks$.value;
  }

  selectAllowLooseLinks() {
    return this.allowLooseLinks$.select();
  }

  setInverseZoom(inverseZoom: boolean) {
    this.inverseZoom$.set(inverseZoom).emit();
  }

  getInverseZoom() {
    return this.inverseZoom$.value;
  }

  selectInverseZoom() {
    return this.inverseZoom$.select();
  }

  setAllowCanvasZoom(allowCanvasZoom: boolean) {
    this.allowCanvasZoom$.set(allowCanvasZoom).emit();
  }

  getAllowCanvasZoom() {
    return this.allowCanvasZoom$.value;
  }

  selectAllowCanvasZoom() {
    return this.allowCanvasTranslation$.select();
  }

  setAllowCanvasTranslation(allowCanvasTranslation: boolean) {
    this.allowCanvasTranslation$.set(allowCanvasTranslation).emit();
  }

  getAllowCanvasTranslation() {
    return this.allowCanvasTranslation$.value;
  }

  selectAllowCanvasTranslation() {
    return this.allowCanvasTranslation$.select();
  }

  setMaxZoomOut(maxZoomOut: number) {
    this.maxZoomOut$.set(maxZoomOut).emit();
  }

  getMaxZoomOut() {
    return this.maxZoomOut$.value;
  }

  selectMaxZoomOut() {
    return this.maxZoomOut$.select();
  }

  setMaxZoomIn(maxZoomIn: number) {
    this.maxZoomIn$.set(maxZoomIn).emit();
  }

  getMaxZoomIn() {
    return this.maxZoomIn$.value;
  }

  setOffset(x: number, y: number) {
    this.offsetX$.set(x).emit();
    this.offsetY$.set(y).emit();
  }

  setOffsetX(x: number) {
    this.offsetX$.set(x).emit();
  }

  getOffsetX(): number {
    return this.offsetX$.value;
  }

  selectOffsetX(): Observable<number> {
    return this.offsetX$.value$;
  }

  setOffsetY(y: number) {
    this.offsetY$.set(y).emit();
  }

  getOffsetY(): number {
    return this.offsetY$.value;
  }

  selectOffsetY(): Observable<number> {
    return this.offsetY$.value$;
  }

  setZoomLevel(z: number) {
    const maxZoomIn = this.getMaxZoomIn();
    const maxZoomOut = this.getMaxZoomOut();

    // check if zoom levels exceeded defined boundaries
    if ((maxZoomIn && z > maxZoomIn) || (maxZoomOut && z < maxZoomOut)) {
      return;
    }

    this.zoom$.set(z).emit();
  }

  getZoomLevel(): number {
    return this.zoom$.value;
  }

  selectZoomLevel(): Observable<number> {
    return this.zoom$.value$;
  }

  getDiagramEngine(): DiagramEngineCore {
    return this.diagramEngine;
  }

  clearSelection(ignore: BaseModel | null = null) {
    this.getSelectedItems().forEach((element) => {
      if (ignore?.id === element.id) {
        return;
      }
      element.setSelected(false);
    });
  }

  getGridPosition({ x, y }: Coords): Coords {
    const gridSize = this.gridSize$.value;
    if (gridSize === 0) {
      return { x, y };
    }

    return {
      x: gridSize * Math.floor((x + gridSize / 2) / gridSize),
      y: gridSize * Math.floor((y + gridSize / 2) / gridSize),
    };
  }

  getSelectedItems(...filters: BaseEntityType[]): (NodeModel | PointModel | PortModel | LinkModel)[] {
    filters = coerceArray(filters);

    const items: (NodeModel | PointModel | PortModel | LinkModel)[] = [];
    const nodes = this.nodes$.array();
    const links = this.links$.array();

    const selectedNodes = (): (NodeModel | PointModel)[] =>
      nodes.flatMap((node) => node.getSelectedEntities());
    const selectedPorts = (): PortModel[] =>
      nodes.flatMap((node) =>
        node
          .getPortsArray()
          .flatMap((port: PortModel) => port.getSelectedEntities() as PortModel[])
      );
    const selectedLinks = (): LinkModel[] =>
      links.flatMap((link) => link.getSelectedEntities() as LinkModel[]);
    const selectedPoints = (): PointModel[] =>
      links.flatMap((link) =>
        link.getPoints().flatMap((point) => point.getSelectedEntities() as PointModel[])
      );

    if (isEmptyArray(filters)) {
      items.push(
        ...selectedNodes(),
        ...selectedPorts(),
        ...selectedLinks(),
        ...selectedPoints()
      );
    } else {
      const byType: Record<BaseEntityType, () => (NodeModel | PointModel | PortModel | LinkModel)[]> = {
        node: selectedNodes,
        port: selectedPorts,
        link: selectedLinks,
        point: selectedPoints,
      };

      for (const type of filters) {
        items.push(...byType[type]());
      }
    }

    return unique(items);
  }

  addAll(...models: BaseModel[]) {
    const links: LinkModel[] = [];
    const nodes: NodeModel[] = [];

    for (const model of models) {
      if (model instanceof LinkModel) {
        links.push(model);
      } else if (model instanceof NodeModel) {
        nodes.push(model);
      }
    }

    this.addLinks(links);
    this.addNodes(nodes);

    return models;
  }

  addLinks(links: LinkModel[]) {
    this.links$.addMany(links).emit();
  }

  addNodes(nodes: NodeModel[]) {
    this.nodes$.addMany(nodes).emit();
  }

  destroy() {
    super.destroy();
    this.nodes$.destroy();
    this.links$.destroy();
  }
}
