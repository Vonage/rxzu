import { Toolkit } from '../tool-kit.service';

export class LinkModel {
    private id: string;
    private from: Coordinates;
    private to: Coordinates;
    private positionFrom: any;
    private positionTo: any;
    private points: any[];

    constructor(from: Coordinates, to: Coordinates, positionFrom: any = {}, positionTo: any = {},
                id: string = Toolkit.UID(), points: any[] = []) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.positionFrom = positionFrom;
        this.positionTo = positionTo;
        this.points = points;
    }

    getId() {
        return this.id;
    }
}
