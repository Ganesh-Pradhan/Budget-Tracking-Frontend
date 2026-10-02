import { Component, Input } from "@angular/core";
@Component({
  selector: "app-carousel",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class CarouselComponent {
  @Input() className = "";
}
