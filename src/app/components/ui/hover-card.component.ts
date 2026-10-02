import { Component, Input } from "@angular/core";
@Component({
  selector: "app-hover-card",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class HoverCardComponent {
  @Input() className = "";
}
