import { Component, Input } from "@angular/core";
@Component({
  selector: "app-avatar",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class AvatarComponent {
  @Input() className = "";
}
