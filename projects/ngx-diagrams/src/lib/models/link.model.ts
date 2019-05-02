import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { PortModel } from './port.model';

export class LinkModel extends BaseModel<DiagramModel> {
    sourcePort: PortModel | null;
    targetPort: PortModel | null;
    // TODO: create point model!
    points: any[];
    extras: any;

    constructor(linkType: string = 'default', id?: string) {
        super(linkType, id);
        // TODO: handle default initial points!
        this.points = [];
        this.extras = {};
        this.sourcePort = null;
        this.targetPort = null;
    }
}
