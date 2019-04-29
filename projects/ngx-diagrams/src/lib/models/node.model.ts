import { Toolkit } from '../tool-kit.service';
import { BehaviorSubject } from 'rxjs';

export class NodeModel {

    private title: string;
    private x: number;
    private y: number;
    private id: string;
    private width: number;
    private height: number;
    // TODO: define type for PORT!
    private $ports: BehaviorSubject<any[]>;

    constructor(title: string, x: number, y: number, id: string = Toolkit.UID(),
                width: number = 200, height: number = 300, ports: any[] = []) {
        this.id = id;
        this.title = title;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.$ports = new BehaviorSubject([]);
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

        this.$ports.next([...this.$ports.value, newPort]);

        return newPort.id;
    }

    /**
     * Get node's id
     */
    getId() {
        return this.id;
    }


}
