import { Component, Input } from "@angular/core";
@Component({
  selector: "app-textarea",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class TextareaComponent {
  @Input() className = "";
}
