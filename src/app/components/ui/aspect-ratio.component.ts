import { Component, Input } from "@angular/core";
@Component({
  selector: "app-aspect-ratio",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class AspectRatioComponent {
  @Input() className = "";
}
