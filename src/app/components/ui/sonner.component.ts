import { Component, Input } from "@angular/core";
@Component({
  selector: "app-sonner",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SonnerComponent {
  @Input() className = "";
}
