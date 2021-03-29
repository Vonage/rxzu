import { NodeModel, NodeModelOptions } from '@rxzu/angular';

export class GHNodeModel extends NodeModel {
  constructor(options: NodeModelOptions) {
    super({
      ...options,
      namespace: 'gh',
    });
  }
}
