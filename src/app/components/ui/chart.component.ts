import { Component, Input } from "@angular/core";
@Component({
  selector: "app-chart",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ChartComponent {
  @Input() className = "";
}
