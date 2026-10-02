import { Component, Input } from "@angular/core";
@Component({
  selector: "app-toggle",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ToggleComponent {
  @Input() className = "";
}
