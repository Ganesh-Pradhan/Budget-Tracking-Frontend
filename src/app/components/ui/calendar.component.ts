import { Component, Input } from "@angular/core";
@Component({
  selector: "app-calendar",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class CalendarComponent {
  @Input() className = "";
}
