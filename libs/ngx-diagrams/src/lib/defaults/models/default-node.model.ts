import { NodeModel } from '../../models/node.model';
import { DefaultPortModel } from './default-port.model';
import { Observable } from 'rxjs';

export class DefaultNodeModel extends NodeModel {
  name: string;
  color: string;
  height$: Observable<number>;
  width$: Observable<number>;

  constructor({
    name = 'Untitled',
    type = 'default',
    color = 'rgb(0, 192, 255)',
    id,
  }: {
    name?: string;
    type?: string;
    id?: string;
    color?: string;
  } = {}) {
    super(type, id);
    this.name = name;
    this.color = color;
    this.height$ = this.selectHeight();
    this.width$ = this.selectWidth();
  }

  addInPort({
    name,
    type = 'default',
    id,
    linkType = 'default',
  }: {
    name: string;
    type?: string;
    id?: string;
    linkType?: string;
  }) {
    const port = new DefaultPortModel({
      isInput: true,
      name,
      type,
      id,
      label: null,
      linkType,
    });
    this.addPort(port);
    return port;
  }

  addOutPort({
    name,
    type = 'default',
    id,
    linkType = 'default',
    maximumLinks = null,
  }: {
    name: string;
    type?: string;
    id?: string;
    linkType?: string;
    maximumLinks?: number;
  }) {
    const port = new DefaultPortModel({
      isInput: false,
      name,
      type,
      id,
      label: null,
      linkType,
      maximumLinks,
    });
    this.addPort(port);
    return port;
  }
}
