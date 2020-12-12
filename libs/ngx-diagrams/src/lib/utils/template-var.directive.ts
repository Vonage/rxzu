import {
  Directive,
  EmbeddedViewRef,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

class TemplateVarContext {
  $implicit: any;
  templateVar: any;
}

@Directive({
  selector: '[templateVar]',
})
export class TemplateVarDirective {
  view: EmbeddedViewRef<any>;

  protected context = new TemplateVarContext();

  @Input()
  set templateVar(context: any) {
    this.context.$implicit = this.context.templateVar = context;
    this.updateView();
  }

  constructor(
    protected vcRef: ViewContainerRef,
    protected templateRef: TemplateRef<any>
  ) {}

  updateView() {
    if (!this.view) {
      this.vcRef.clear();
      this.view = this.vcRef.createEmbeddedView(this.templateRef, this.context);
    } else {
      this.view.markForCheck();
    }
  }
}
