import { BehaviorSubject } from 'rxjs';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';

export interface DiagramDataModel {
    $nodes: BehaviorSubject<NodeModel[]>;
    $links: BehaviorSubject<any[]>;
}

export class DiagramModel {

    // TODO: add types for nodes and links!
    private model: DiagramDataModel = {
        $nodes: new BehaviorSubject<NodeModel[]>([]),
        $links: new BehaviorSubject<LinkModel[]>([])
    };

    // TODO: support the following events for links and nodes
    // removed, updated<positionChanged/dataChanged>, added

    /**
     * Add a node to the diagram
     * @returns New Node
     */
    addNode(title: string, x: number, y: number): NodeModel {
        const newNode = new NodeModel(title, x, y);
        this.model.$nodes.next([...this.model.$nodes.value, newNode]);
        return newNode;
    }

    /**
     * Delete a node from the diagram
     */
    deleteNode(nodeOrId: NodeModel | string): void {
        let index = -1;
        if (typeof nodeOrId === 'string') {
            index = this.model.$nodes.value.findIndex(node => node.getId() === nodeOrId);
        } else {
            index = this.model.$nodes.value.indexOf(nodeOrId);
        }

        // TODO: delete all related links
        const updNodes = [...this.model.$nodes.value];
        updNodes.splice(index, 1);
        this.model.$nodes.next(updNodes);
    }

    /**
     * Get raw value of the nodes
     */
    getNodes(): NodeModel[] {
        return this.model.$nodes.value;
    }

    /**
     * Get subscribable of the nodes
     */
    selectNodes(): BehaviorSubject<NodeModel[]> {
        return this.model.$nodes;
    }

    addLink(from: Coordinates, to: Coordinates): LinkModel {
        const newLink = new LinkModel(from, to);
        this.model.$links.next([...this.model.$links.value, newLink]);
        return newLink;
    }

    deleteLink(linkOrId: LinkModel | string) {
        let index = -1;
        if (typeof linkOrId === 'string') {
            index = this.model.$links.value.findIndex(node => node.getId() === linkOrId);
        } else {
            index = this.model.$links.value.indexOf(linkOrId);
        }

        const updLinks = [...this.model.$links.value];
        updLinks.splice(index, 1);
        this.model.$links.next(updLinks);
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
