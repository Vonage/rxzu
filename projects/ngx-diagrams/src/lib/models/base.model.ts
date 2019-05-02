import { BaseEntity } from '../base.entity';

export class BaseModel<X extends BaseEntity = BaseEntity> extends BaseEntity {

    private type: string;
    private selected: boolean;
    private parent: X;

    constructor(type?: string, id?: string) {
        super(id);
        this.type = type;
        this.selected = false;
    }

    getParent(): X {
        return this.parent;
    }

    setParent(parent: X) {
        this.parent = parent;
    }

    getSelectedEntities(): BaseModel<X>[] {
        return this.selected ? [this] : [];
    }

    getType() {
        return this.type;
    }

    getID() {
        return this.id;
    }

    isSelected() {
        return this.selected;
    }

    setSelected(selected: boolean = true) {
        this.selected = selected;
    }

    public remove() {
        // TODO: event bus?
        // https://github.com/projectstorm/react-diagrams/blob/master/src/models/BaseModel.ts#L79-L83
    }


}
