import { UID } from './tool-kit.service';


export type BaseEntityType = 'node' | 'link' | 'port';

export class BaseEntity {
    public id: string;
    public locked: boolean;

    constructor(id?: string) {
        this.id = id || UID();
    }

    getID() {
        return this.id;
    }

    isLocked() {
        return this.locked;
    }

    setLocked(locked: boolean = true) {
        this.locked = locked;
        // TODO: handle instance events somehow, maybe event bus?
        // https://github.com/projectstorm/react-diagrams/blob/master/src/BaseEntity.ts#L109-L112
    }
}
