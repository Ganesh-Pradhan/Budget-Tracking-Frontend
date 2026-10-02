import { Component, Input } from "@angular/core";
@Component({
  selector: "app-popover",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class PopoverComponent {
  @Input() className = "";
}
