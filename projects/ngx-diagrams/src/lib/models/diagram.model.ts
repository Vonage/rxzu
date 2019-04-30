import { BehaviorSubject } from 'rxjs';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';

export interface DiagramDataModel {
    nodes$: BehaviorSubject<{ [s: string]: NodeModel }>;
    links$: BehaviorSubject<{ [s: string]: LinkModel }>;
    zoom: number;
    offsetX: number;
    offsetY: number;
    gridSize: number;
}

// @Injectable()
export class DiagramModel {

    // TODO: add types for nodes and links!
    private model: DiagramDataModel = {
        nodes$: new BehaviorSubject<{ [s: string]: NodeModel }>({}),
        links$: new BehaviorSubject<{ [s: string]: LinkModel }>({}),
        zoom: 100,
        offsetX: 0,
        offsetY: 0,
        gridSize: 0
    };

    // TODO: support the following events for links and nodes
    // removed, updated<positionChanged/dataChanged>, added

    /**
     * Add a node to the diagram
     * @returns New Node
     */
    addNode(title: string, x: number, y: number): NodeModel {
        const newNode = new NodeModel(title, x, y);
        this.model.nodes$.next({ ...this.model.nodes$.value, [newNode.getId()]: newNode });
        return newNode;
    }

    /**
     * Delete a node from the diagram
     */
    deleteNode(nodeOrId: NodeModel | string): void {
        const nodeId: string = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.getId();

        // TODO: delete all related links
        const updNodes = { ...this.model.nodes$.value };
        delete updNodes[nodeId];
        this.model.nodes$.next(updNodes);
    }

    /**
     * Get nodes behaviour subject, use `.value` for snapshot
     */
    selectNodes(): BehaviorSubject<{ [s: string]: NodeModel }> {
        return this.model.nodes$;
    }

    /**
     * Add link
     * @returns Newly created link
     */
    addLink(from: Coordinates, to: Coordinates): LinkModel {
        const newLink = new LinkModel(from, to);
        this.model.links$.next({ ...this.model.links$.value, [newLink.getId()]: newLink });
        return newLink;
    }

    /**
     * Delete link
     */
    deleteLink(linkOrId: LinkModel | string) {
        const linkId: string = typeof linkOrId === 'string' ? linkOrId : linkOrId.getId();

        const updLinks = { ...this.model.links$.value };
        delete updLinks[linkId];

        this.model.links$.next(updLinks);
    }

    /**
     * Get links behaviour subject, use `.value` for snapshot
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

}
