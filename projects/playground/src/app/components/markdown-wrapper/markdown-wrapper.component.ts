import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-markdown-wrapper',
  templateUrl: './markdown-wrapper.component.html',
  styleUrls: ['./markdown-wrapper.component.scss']
})
export class MarkdownWrapperComponent {

  @Input() rawMarkdown: string;

  constructor() { }

}
