import { Component, Input } from "@angular/core";
@Component({
  selector: "app-switch",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SwitchComponent {
  @Input() className = "";
}
