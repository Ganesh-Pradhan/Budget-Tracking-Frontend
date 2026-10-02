import { Component, Input } from "@angular/core";
@Component({
  selector: "app-tooltip",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class TooltipComponent {
  @Input() className = "";
}
