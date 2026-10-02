import { Component, Input } from "@angular/core";
@Component({
  selector: "app-collapsible",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class CollapsibleComponent {
  @Input() className = "";
}
