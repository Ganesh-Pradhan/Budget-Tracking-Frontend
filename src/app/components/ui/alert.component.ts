import { Component, Input } from "@angular/core";
@Component({
  selector: "app-alert",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class AlertComponent {
  @Input() className = "";
}
