import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  IterableDiffers,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  DefaultNodeComponent,
  MODEL,
  RxZuDiagramComponent,
  EngineService,
} from '@rxzu/angular';
import { BehaviorSubject } from 'rxjs';
import { NodeStatus, VStudioNodeModel } from '../../models';

@Component({
  selector: 'rxzu-vonage-studio-node',
  templateUrl: './vonage-studio-node.component.html',
  styleUrls: ['./vonage-studio-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VStudioNodeComponent
  extends DefaultNodeComponent
  implements OnInit {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;

  nodeGradient =
    'linear-gradient(to right,rgb(242, 242, 242) 0%, rgb(242, 242, 242) 100%)';
  boxShadow$: BehaviorSubject<string>;

  constructor(
    @Inject(MODEL) public model: VStudioNodeModel,
    engine: EngineService,
    diagram: RxZuDiagramComponent,
    iterableDiffers: IterableDiffers
  ) {
    super(model, engine, diagram, iterableDiffers);
    this.boxShadow$ = new BehaviorSubject('0px 4px 12px rgba(0, 0, 0, 0.25)');

    model.selectExtras().subscribe((extras: any) => {
      if (extras.color) {
        this.nodeGradient = this.createNodeGradient(extras.color);
      }
    });

    model.selectSelected().subscribe((selected) => {
      this.boxShadow$.next(this.createSelectedShadow(selected));
      this.updateLinksState(selected);
    });

    model.selectStatus().subscribe((status) => {
      this.boxShadow$.next(this.createStatusShadow(status));

      if (status === NodeStatus.ERROR) {
        // iterate over all ports and links, color links as red links (254, 150, 150),
        // or even better set their state to error state.
      }
    });

    this.model.selectPorts().subscribe((ports) => {
      ports.forEach((port) => {
        port.selectLinks().subscribe((links) => {
          this.model.setStatus(this.calculateStatus());
        });
      });
    });
  }

  calculateStatus() {
    let numOfLinks = 0;
    const infiniteLoop = false;
    const badConnections = false;

    this.model.getPorts().forEach((port) => {
      numOfLinks += port.getLinks().size;
    });

    if (numOfLinks <= 0) {
      return NodeStatus.WARNING;
    }

    if (infiniteLoop || badConnections) {
      return NodeStatus.ERROR;
    }

    return NodeStatus.DEFAULT;
  }

  createStatusShadow(status: NodeStatus) {
    switch (status) {
      case NodeStatus.WARNING:
        return '0px 4px 12px rgba(250, 212, 109, 0.7)';
      case NodeStatus.ERROR:
        return '0px 4px 12px rgba(254, 150, 150, 0.7)';
      case NodeStatus.DEFAULT:
      default:
        return '0px 4px 12px rgba(0, 0, 0, 0.25)';
    }
  }

  updateLinksState(selected: boolean) {
    this.model.getPorts().forEach((port) => {
      port.getLinks().forEach((link) => {
        link.setSelected(selected);
      });
    });
  }

  createSelectedShadow(selected: boolean) {
    return selected
      ? '0px 4px 12px rgba(101, 186, 255, 0.7)'
      : this.createStatusShadow(this.calculateStatus());
  }

  createNodeGradient(color: string) {
    return `linear-gradient(to right, ${color} 0%, ${color} 2%, rgb(242, 242, 242) 2%)`;
  }
}
