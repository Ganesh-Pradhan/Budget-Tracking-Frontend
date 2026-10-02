import { Component, Input } from "@angular/core";
@Component({
  selector: "app-accordion",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class AccordionComponent {
  @Input() className = "";
}
