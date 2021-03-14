import { PortModel, ValueState, PortModelOptions } from '@rxzu/core';

export class GHPortModel extends PortModel {
  direction$: ValueState<'in' | 'out'>;
  constructor(options: PortModelOptions & { direction?: 'in' | 'out' }) {
    super({
      ...options,
      namespace: 'gh',
      linkNamespace: 'gh',
    });
    this.direction$ = new ValueState(options.direction ?? 'in');
    this.setCanCreateLinks(this.direction$.value === 'out');
  }

  canLinkToPort(port: GHPortModel) {
    if (port.getParent() === this.getParent()) {
      return false;
    }

    return true;
  }
}
