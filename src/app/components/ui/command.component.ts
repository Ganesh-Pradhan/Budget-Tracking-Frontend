import { Component, Input } from "@angular/core";
@Component({
  selector: "app-command",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class CommandComponent {
  @Input() className = "";
}
