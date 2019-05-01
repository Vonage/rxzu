import { Component, OnInit, Input } from '@angular/core';
import { DefaultPort } from '../../../models/port.model';

@Component({
  selector: 'ngdx-default-port',
  templateUrl: './port.component.html',
  styleUrls: ['./port.component.scss']
})
export class PortComponent implements OnInit {
  @Input() port: DefaultPort;
  @Input() key: string;

  constructor() { }

  ngOnInit() {
  }

}
