import {
  PortModel,
  ValueState,
  PortModelOptions,
  createValueState,
} from '@rxzu/angular';

export class VStudioPortModel extends PortModel {
  direction$: ValueState<'in' | 'out'>;
  constructor(options: PortModelOptions & { direction?: 'in' | 'out' }) {
    super({
      ...options,
      namespace: 'vstudio',
      linkNamespace: 'vstudio',
    });

    this.direction$ = createValueState(options.direction ?? 'in');
    this.setCanCreateLinks(this.direction$.value === 'out');
  }

  canLinkToPort(port: VStudioPortModel) {
    if (port.getParent() === this.getParent()) {
      return false;
    }

    return true;
  }
}
