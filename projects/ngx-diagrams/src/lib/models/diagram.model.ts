import { BehaviorSubject } from 'rxjs';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BaseEntity } from '../base.entity';
import { DiagramEngine } from '../engine.service';

export interface DiagramDataModel {
    nodes$: BehaviorSubject<{ [s: string]: NodeModel }>;
    links$: BehaviorSubject<{ [s: string]: LinkModel }>;
    zoom$: BehaviorSubject<number>;
    offsetX$: BehaviorSubject<number>;
    offsetY$: BehaviorSubject<number>;
    gridSize$: BehaviorSubject<number>;
    diagramEngine: DiagramEngine;
}

export class DiagramModel extends BaseEntity {

    constructor(private diagramEngine: DiagramEngine) {
        super();
    }

    private model: DiagramDataModel = {
        nodes$: new BehaviorSubject<{ [s: string]: NodeModel }>({}),
        links$: new BehaviorSubject<{ [s: string]: LinkModel }>({}),
        zoom$: new BehaviorSubject(100),
        offsetX$: new BehaviorSubject(0),
        offsetY$: new BehaviorSubject(0),
        gridSize$: new BehaviorSubject(0),
        diagramEngine: this.diagramEngine
    };

    // TODO: support the following events for links and nodes
    // removed, updated<positionChanged/dataChanged>, added

    /**
     * Add a node to the diagram
     * @returns Inserted Node
     */
    addNode(node: NodeModel): NodeModel {
        this.model.nodes$.next({ ...this.model.nodes$.getValue(), [node.getID()]: node });
        return node;
    }

    /**
     * Delete a node from the diagram
     */
    deleteNode(nodeOrId: NodeModel | string): void {
        const nodeId: string = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.getID();

        // TODO: delete all related links
        const updNodes = { ...this.model.nodes$.getValue() };
        delete updNodes[nodeId];
        this.model.nodes$.next(updNodes);
    }

    /**
     * Get nodes behaviour subject, use `.getValue()` for snapshot
     */
    selectNodes(): BehaviorSubject<{ [s: string]: NodeModel }> {
        return this.model.nodes$;
    }

    /**
     * Add link
     * @returns Newly created link
     */
    addLink(link: LinkModel): LinkModel {
        this.model.links$.next({ ...this.model.links$.getValue(), [link.getID()]: link });
        return link;
    }

    /**
     * Delete link
     */
    deleteLink(linkOrId: LinkModel | string) {
        const linkId: string = typeof linkOrId === 'string' ? linkOrId : linkOrId.getID();

        const updLinks = { ...this.model.links$.getValue() };
        delete updLinks[linkId];

        this.model.links$.next(updLinks);
    }

    /**
     * Get links behaviour subject, use `.getValue()` for snapshot
     */
    selectLinks(): BehaviorSubject<{ [s: string]: LinkModel }> {
        return this.model.links$;
    }

    /**
     * Serialize the diagram model
     * @returns diagram model as a string
     */
    serialize(): string {
        return JSON.stringify(this.model);
    }

    /**
     * Load into the diagram model a serialized diagram
     */
    deserialize(serializedModel: string) {
        this.model = JSON.parse(serializedModel);
    }

    setOffset(x: number, y: number) {
        this.model.offsetX$.next(x);
        this.model.offsetY$.next(y);
    }

    setOffsetX(x: number) {
        this.model.offsetX$.next(x);
    }

    getOffsetX(): BehaviorSubject<number> {
        return this.model.offsetX$;
    }

    setOffsetY(y: number) {
        this.model.offsetY$.next(y);
    }

    getOffsetY(): BehaviorSubject<number> {
        return this.model.offsetY$;
    }

    setZoomLevel(z: number) {
        this.model.zoom$.next(z);
    }

    getZoomLevel(): BehaviorSubject<number> {
        return this.model.zoom$;
    }

    getDiagramEngine(): DiagramEngine {
        return this.model.diagramEngine;
    }
}
