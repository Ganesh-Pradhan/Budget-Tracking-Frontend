import { Component, Input } from "@angular/core";
@Component({
  selector: "app-toggle-group",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ToggleGroupComponent {
  @Input() className = "";
}
