import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DefaultNodeModel } from '@rxzu/core';

@Component({
  selector: 'custom-node',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CustomNodeComponent extends DefaultNodeModel implements OnInit {
  nodeContent: string;

  constructor() {
    super({ type: 'custom-node' });
  }

  ngOnInit() {
    this.nodeContent = 'Pick me!';
    this.selectSelected().subscribe((selected) => {
      this.nodeContent = selected ? 'Thank you 🙏' : 'Pick me!';
    });
    this.setPainted(true);
  }
}
