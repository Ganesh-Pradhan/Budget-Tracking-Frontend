import { Component, Input } from "@angular/core";
@Component({
  selector: "app-kbd",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class KbdComponent {
  @Input() className = "";
}
