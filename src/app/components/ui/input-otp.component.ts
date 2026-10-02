import { Component, Input } from "@angular/core";
@Component({
  selector: "app-input-otp",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class InputOtpComponent {
  @Input() className = "";
}
