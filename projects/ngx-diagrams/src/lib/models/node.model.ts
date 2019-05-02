import * as Toolkit from '../tool-kit.service';
import { BehaviorSubject } from 'rxjs';
import { PortModel } from './port.model';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';

export class NodeModel extends BaseModel<DiagramModel> {

    x: number;
    y: number;
    id: string;
    extras: { [s: string]: any };
    ports$: BehaviorSubject<{ [s: string]: PortModel }>;

    constructor(nodeType: string = 'default', id?: string) {
        super(nodeType, id);
        this.x = 0;
        this.y = 0;
        this.extras = {};
        this.ports$ = new BehaviorSubject({});
    }

    setPosition(x: number, y: number) {
        // update ports position as well
        // https://github.com/projectstorm/react-diagrams/blob/master/src/models/NodeModel.ts#L31-L44

        this.x = x;
        this.y = y;
    }

    /**
     * Creates new port and adds it to the node, position will be
     * decided based on the port type.
     * @returns New port id
     */
    addPort(name: string, type: 'in' | 'out', id: string = Toolkit.UID()): string {
        const newPort = new PortModel(name, type, id);
        this.ports$.next({ ...this.ports$.getValue(), [newPort.id]: newPort });
        return newPort.id;
    }
}
