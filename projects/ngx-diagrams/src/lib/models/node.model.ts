import * as Toolkit from '../tool-kit.service';
import { BehaviorSubject } from 'rxjs';
import { DefaultPort } from './port.model';

export class NodeModel {

    title: string;
    x: number;
    y: number;
    id: string;
    width: number;
    height: number;
    ports$: BehaviorSubject<{ [s: string]: DefaultPort }>;

    constructor(title: string, x: number, y: number, id: string = Toolkit.UID(),
                width: number = 200, height: number = 300, ports: { [s: string]: DefaultPort } = {}) {
        this.id = id;
        this.title = title;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ports$ = new BehaviorSubject(ports);
    }

    /**
     * Creates new port and adds it to the node, position will be
     * decided based on the port type.
     * @returns New port id
     */
    addPort(name: string, type: 'in' | 'out', id: string = Toolkit.UID()): string {
        const newPort = {
            id,
            name,
            type
        };

        this.ports$.next({ ...this.ports$.getValue(), [newPort.id]: newPort });

        return newPort.id;
    }

    /**
     * Get node's id
     */
    getId() {
        return this.id;
    }


}
