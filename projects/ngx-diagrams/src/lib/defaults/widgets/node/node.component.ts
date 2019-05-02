import { Component, OnInit, Input } from '@angular/core';
import { NodeModel } from '../../../models/node.model';

export interface DefaultNodeModel extends NodeModel {
  name: string;
  color: string;
}

@Component({
  selector: 'ngdx-default-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class DefaultNodeComponent extends NodeModel implements OnInit {

  @Input() node: NodeModel;

  constructor() {
    super('default');
  }

  ngOnInit() {
  }

  // https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/models/DefaultNodeModel.ts

}
