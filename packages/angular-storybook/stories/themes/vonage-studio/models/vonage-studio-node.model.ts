import {
  createValueState,
  NodeModel,
  NodeModelOptions,
  ValueState,
} from '@rxzu/angular';

export enum NodeStatus {
  DEFAULT = 'default',
  WARNING = 'warning',
  ERROR = 'error',
}

export class VStudioNodeModel extends NodeModel {
  status$: ValueState<NodeStatus>;

  constructor(options: NodeModelOptions) {
    super({
      ...options,
      namespace: 'vstudio',
    });

    this.status$ = createValueState<NodeStatus>(NodeStatus.DEFAULT);
  }

  selectStatus() {
    return this.status$.select();
  }

  setStatus(status: NodeStatus) {
    this.status$.set(status);
  }
}
