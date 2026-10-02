import { Component, Input } from "@angular/core";
@Component({
  selector: "app-button-group",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ButtonGroupComponent {
  @Input() className = "";
}
