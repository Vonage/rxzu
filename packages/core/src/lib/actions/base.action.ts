export class BaseAction {
    ms: number;

    constructor() {
        this.ms = new Date().getTime();
    }
}
