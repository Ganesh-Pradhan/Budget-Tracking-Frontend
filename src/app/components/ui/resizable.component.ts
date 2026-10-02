import { Component, Input } from "@angular/core";
@Component({
  selector: "app-resizable",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ResizableComponent {
  @Input() className = "";
}
