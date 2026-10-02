import { Component, Input } from "@angular/core";
@Component({
  selector: "app-toast",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ToastComponent {
  @Input() className = "";
}
