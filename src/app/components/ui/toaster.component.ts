import { Component, Input } from "@angular/core";
@Component({
  selector: "app-toaster",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ToasterComponent {
  @Input() className = "";
}
