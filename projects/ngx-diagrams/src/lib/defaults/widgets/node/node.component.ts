import { Component, OnInit, Input } from '@angular/core';
import { NodeModel } from '../../../models/node.model';

@Component({
  selector: 'ngdx-default-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class DefaultNodeComponent implements OnInit {

  @Input() node: NodeModel;
  @Input() key: string;

  constructor() { }

  ngOnInit() {
  }

}
