import { Component, Input } from "@angular/core";
@Component({
  selector: "app-breadcrumb",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class BreadcrumbComponent {
  @Input() className = "";
}
