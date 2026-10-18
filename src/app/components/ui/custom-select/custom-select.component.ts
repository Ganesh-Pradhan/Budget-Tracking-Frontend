import { Component, forwardRef, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { LucideAngularModule } from "lucide-angular";

export type SelectOption = string | any;

@Component({
  selector: "app-custom-select",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomSelectComponent), multi: true },
  ],
  templateUrl: "./custom-select.component.html",
  styleUrl: "./custom-select.component.css",
})
export class CustomSelectComponent implements OnChanges {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = "";
  @Input() disabled = false;
  @Input() value: any;
  @Input() labelField = "label";
  @Input() valueField = "value";
  @Input() disabledField = "disabled";
  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;
  selectedValue: any;
  displayValue = "";

  private onChange = (value: any) => {};
  private onTouched = () => {};

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["options"] || changes["value"]) {
      this.updateDisplayValue();
    }
  }

  writeValue(value: any): void {
    this.selectedValue = value;
    this.updateDisplayValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  select(option: SelectOption) {
    if (this.isOptionDisabled(option)) return;
    const value = this.getOptionValue(option);
    const label = this.getOptionLabel(option);
    this.selectedValue = value;
    this.displayValue = label;
    this.isOpen = false;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  getOptionLabel(option: SelectOption): string {
    if (typeof option === "string") return option;
    if (option[this.labelField] !== undefined) return option[this.labelField];
    return option.label ?? String(option);
  }

  getOptionValue(option: SelectOption): any {
    if (typeof option === "string") return option;
    if (option[this.valueField] !== undefined) return option[this.valueField];
    return option.value ?? option;
  }

  isSelected(option: SelectOption): boolean {
    return this.getOptionValue(option) === this.selectedValue;
  }

  isOptionDisabled(option: SelectOption): boolean {
    if (typeof option === "string") return false;
    return option[this.disabledField] === true;
  }

  private updateDisplayValue() {
    const val = this.value != null ? this.value : this.selectedValue;
    if (val == null || val === "") {
      this.displayValue = this.placeholder;
    } else {
      const found = this.options.find((o) => this.getOptionValue(o) === val);
      this.displayValue = found ? this.getOptionLabel(found) : String(val);
    }
  }
}