import { Component, OnInit, Input } from '@angular/core';
import { NodeModel } from '../../../models/node.model';

export interface DefaultNodeModel {
  name: string;
  color: string;
}

@Component({
  selector: 'ngdx-default-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class DefaultNodeComponent extends NodeModel implements OnInit {

  @Input() name: string;
  @Input() color: string;
  @Input() node: NodeModel;
  @Input() key: string;

  constructor() {
    super('default');
  }

  ngOnInit() {
  }

  // https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/models/DefaultNodeModel.ts

}
