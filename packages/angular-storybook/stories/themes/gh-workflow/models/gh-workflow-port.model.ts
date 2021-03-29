import {
  PortModel,
  ValueState,
  PortModelOptions,
  createValueState,
} from '@rxzu/angular';

export class GHPortModel extends PortModel {
  direction$: ValueState<'in' | 'out'>;
  constructor(options: PortModelOptions & { direction?: 'in' | 'out' }) {
    super({
      ...options,
      namespace: 'gh',
      linkNamespace: 'gh',
    });
    this.direction$ = createValueState(options.direction ?? 'in');
    this.setCanCreateLinks(this.direction$.value === 'out');
  }

  canLinkToPort(port: GHPortModel) {
    if (port.getParent() === this.getParent()) {
      return false;
    }

    return true;
  }
}
