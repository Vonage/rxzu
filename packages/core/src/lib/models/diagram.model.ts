import { Observable } from 'rxjs';
import { BaseEntity } from '../base.entity';
import { DiagramEngine } from '../engine.core';
import { SelectOptions, Coords, BaseEntityType } from '../interfaces';
import { AnimationConfig } from '../interfaces/animation.interface';
import {
  createEntityState,
  createValueState,
  EntityState,
  ValueState,
} from '../state';
import { coerceArray, EntityMap, ID, isEmptyArray, unique } from '../utils';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { NodeModel } from './node.model';
import { PortModel } from './port.model';
import { PointModel } from './point.model';
import {
  DiagramModelOptions,
  KeyBindigsOptions,
} from '../interfaces/options.interface';

export class DiagramModel extends BaseEntity {
  private _diagramEngine?: DiagramEngine;
  protected nodes$: EntityState<NodeModel>;
  protected links$: EntityState<LinkModel>;
  protected offsetX$: ValueState<number>;
  protected offsetY$: ValueState<number>;
  protected zoom$: ValueState<number>;
  protected maxZoomOut$: ValueState<number>;
  protected maxZoomIn$: ValueState<number>;
  protected gridSize$: ValueState<number>;
  protected allowCanvasZoom$: ValueState<boolean>;
  protected allowCanvasTranslation$: ValueState<boolean>;
  protected inverseZoom$: ValueState<boolean>;
  protected allowLooseLinks$: ValueState<boolean>;
  protected portMagneticRadius$: ValueState<number>;
  protected keyBindings$: ValueState<KeyBindigsOptions>;
  protected animation$ = createValueState<AnimationConfig | null>(null);

  constructor(
    options: DiagramModelOptions = {},
    diagramEngine?: DiagramEngine
  ) {
    super({ type: 'diagram', logPrefix: '[Diagram]', ...options });

    if (diagramEngine) {
      this._diagramEngine = diagramEngine;
    }

    this.nodes$ = createEntityState([], this.entityPipe('nodes'));
    this.links$ = createEntityState([], this.entityPipe('links'));
    this.offsetX$ = createValueState(
      options.offsetX ?? 0,
      this.entityPipe('offsetX')
    );
    this.offsetY$ = createValueState(
      options.offsetY ?? 0,
      this.entityPipe('offsetY')
    );
    this.zoom$ = createValueState(options.zoom ?? 100, this.entityPipe('zoom'));
    this.maxZoomOut$ = createValueState(
      options.maxZoomOut ?? 0,
      this.entityPipe('maxZoomOut')
    );
    this.maxZoomIn$ = createValueState(
      options.maxZoomIn ?? 0,
      this.entityPipe('maxZoomIn')
    );
    this.gridSize$ = createValueState(
      options.gridSize ?? 0,
      this.entityPipe('gridSize')
    );
    this.allowCanvasZoom$ = createValueState<boolean>(
      options.allowCanvasZoom ?? true,
      this.entityPipe('allowCanvasZoom')
    );
    this.allowCanvasTranslation$ = createValueState<boolean>(
      options.allowCanvasTranslation ?? true,
      this.entityPipe('allowCanvasTranslation')
    );
    this.inverseZoom$ = createValueState<boolean>(
      options.inverseZoom ?? true,
      this.entityPipe('inverseZoom')
    );
    this.allowLooseLinks$ = createValueState<boolean>(
      options.allowLooseLinks ?? true,
      this.entityPipe('allowLooseLinks')
    );
    this.portMagneticRadius$ = createValueState(
      options.portMagneticRadius ?? 30,
      this.entityPipe('portMagneticRadius')
    );
    this.keyBindings$ = createValueState(
      options.keyBindings ?? {},
      this.entityPipe('keyBindings')
    );
  }

  set diagramEngine(value: DiagramEngine | undefined) {
    this._diagramEngine = value;
  }

  get diagramEngine(): DiagramEngine | undefined {
    return this._diagramEngine;
  }

  getNodes(): EntityMap<NodeModel> {
    return this.nodes$.value;
  }

  getNodesArray(): NodeModel[] {
    return this.nodes$.array();
  }

  getNode(id?: ID | null): NodeModel | undefined {
    return (id && this.nodes$.get(id)) || undefined;
  }

  getLink(id?: ID | null): LinkModel | undefined {
    return (id && this.links$.get(id)) || undefined;
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
    this.nodes$.add(node);
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

    this.nodes$.remove(nodeId);
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
    this.links$.add(link);
    return link;
  }

  /**
   * Delete link
   */
  deleteLink(linkOrId: LinkModel | string) {
    const linkId: ID = typeof linkOrId === 'string' ? linkOrId : linkOrId.id;
    this.links$.remove(linkId);
  }

  reset() {
    this.nodes$.clear();
    this.links$.clear();
  }

  /**
   * Get links behaviour subject, use `.getValue()` for snapshot
   */
  selectLinks(): Observable<EntityMap<LinkModel>> {
    return this.links$.value$;
  }

  setPortMagneticRadius(portMagneticRadius: number) {
    this.portMagneticRadius$.set(portMagneticRadius);
  }

  getPortMagneticRadius() {
    return this.portMagneticRadius$.value;
  }

  selectPortMagneticRadius() {
    return this.portMagneticRadius$.select();
  }

  setAllowLooseLinks(allowLooseLinks: boolean) {
    this.allowLooseLinks$.set(allowLooseLinks);
  }

  getAllowLooseLinks() {
    return this.allowLooseLinks$.value;
  }

  selectAllowLooseLinks() {
    return this.allowLooseLinks$.select();
  }

  setInverseZoom(inverseZoom: boolean) {
    this.inverseZoom$.set(inverseZoom);
  }

  getInverseZoom() {
    return this.inverseZoom$.value;
  }

  selectInverseZoom() {
    return this.inverseZoom$.select();
  }

  setKeyBindings(keyBindings: KeyBindigsOptions) {
    this.keyBindings$.set(keyBindings);
  }

  getKeyBindings() {
    return this.keyBindings$.value;
  }

  selectKeyBindings() {
    return this.keyBindings$.select();
  }

  setAllowCanvasZoom(allowCanvasZoom: boolean) {
    this.allowCanvasZoom$.set(allowCanvasZoom);
  }

  getAllowCanvasZoom() {
    return this.allowCanvasZoom$.value;
  }

  selectAllowCanvasZoom() {
    return this.allowCanvasTranslation$.select();
  }

  setAllowCanvasTranslation(allowCanvasTranslation: boolean) {
    this.allowCanvasTranslation$.set(allowCanvasTranslation);
  }

  getAllowCanvasTranslation() {
    return this.allowCanvasTranslation$.value;
  }

  selectAllowCanvasTranslation() {
    return this.allowCanvasTranslation$.select();
  }

  setMaxZoomOut(maxZoomOut: number) {
    this.maxZoomOut$.set(maxZoomOut);
  }

  getMaxZoomOut() {
    return this.maxZoomOut$.value;
  }

  selectMaxZoomOut() {
    return this.maxZoomOut$.select();
  }

  setMaxZoomIn(maxZoomIn: number) {
    this.maxZoomIn$.set(maxZoomIn);
  }

  getMaxZoomIn() {
    return this.maxZoomIn$.value;
  }

  setOffset(x: number, y: number) {
    this.offsetX$.set(x);
    this.offsetY$.set(y);
  }

  setOffsetX(x: number) {
    this.offsetX$.set(x);
  }

  getOffsetX(): number {
    return this.offsetX$.value;
  }

  selectOffsetX(): Observable<number> {
    return this.offsetX$.value$;
  }

  setOffsetY(y: number) {
    this.offsetY$.set(y);
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

    this.zoom$.set(z);
  }

  getZoomLevel(): number {
    return this.zoom$.value;
  }

  selectZoomLevel(): Observable<number> {
    return this.zoom$.value$;
  }

  selectAnimation(): Observable<AnimationConfig | null> {
    return this.animation$.select();
  }

  animate(callback: () => void, config?: AnimationConfig): void {
    const merged: AnimationConfig = {
      timing: 200,
      easing: 'ease-in-out',
      ...config,
    };
    this.animation$.set(merged);
    callback();
    setTimeout(() => {
      this.animation$.set(null);
    }, merged.timing);
  }

  getDiagramEngine(): DiagramEngine | undefined {
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

  getSelectedItems(
    ...filters: Exclude<BaseEntityType, 'diagram' | 'label'>[]
  ): (NodeModel | PointModel | PortModel | LinkModel)[] {
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
          .flatMap(
            (port: PortModel) => port.getSelectedEntities() as PortModel[]
          )
      );
    const selectedLinks = (): LinkModel[] =>
      links.flatMap((link) => link.getSelectedEntities() as LinkModel[]);
    const selectedPoints = (): PointModel[] =>
      links.flatMap((link) =>
        link
          .getPoints()
          .flatMap((point) => point.getSelectedEntities() as PointModel[])
      );

    if (isEmptyArray(filters)) {
      items.push(
        ...selectedNodes(),
        ...selectedPorts(),
        ...selectedLinks(),
        ...selectedPoints()
      );
    } else {
      const byType: Record<
        Exclude<BaseEntityType, 'diagram' | 'label'>,
        () => (NodeModel | PointModel | PortModel | LinkModel)[]
      > = {
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
    this.links$.addMany(links);
  }

  addNodes(nodes: NodeModel[]) {
    this.nodes$.addMany(nodes);
  }

  destroy() {
    super.destroy();
    this.nodes$.destroy();
    this.links$.destroy();
  }
}
