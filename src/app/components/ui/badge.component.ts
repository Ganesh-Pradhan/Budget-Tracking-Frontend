import { Component, Input } from "@angular/core";
@Component({
  selector: "app-badge",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class BadgeComponent {
  @Input() className = "";
}
