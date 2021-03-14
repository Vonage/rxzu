import { NodeModel, NodeModelOptions } from '@rxzu/core';

export class GHNodeModel extends NodeModel {
  constructor(options: NodeModelOptions) {
    super({
      ...options,
      namespace: 'gh',
      dimensions: { height: 50, width: 260 },
    });
  }
}
