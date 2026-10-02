import { Component, Input } from "@angular/core";
@Component({
  selector: "app-input-group",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class InputGroupComponent {
  @Input() className = "";
}
