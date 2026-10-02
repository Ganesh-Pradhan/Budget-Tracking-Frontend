import { Component, Input } from "@angular/core";
@Component({
  selector: "app-scroll-area",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ScrollAreaComponent {
  @Input() className = "";
}
