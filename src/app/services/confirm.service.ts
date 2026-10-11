import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ConfirmService {
  private _visible = signal(false);
  private _title = signal("");
  private _message = signal("");
  private _confirmText = signal("Confirm");
  private _cancelText = signal("Cancel");
  private _isDeleting = signal(false);
  private _resolveFn: ((value: boolean) => void) | null = null;

  readonly visible = this._visible.asReadonly();
  readonly title = this._title.asReadonly();
  readonly message = this._message.asReadonly();
  readonly confirmText = this._confirmText.asReadonly();
  readonly cancelText = this._cancelText.asReadonly();
  readonly isDeleting = this._isDeleting.asReadonly();

  async confirm(
    title: string,
    message: string,
    options: {
      confirmText?: string;
      cancelText?: string;
    } = {}
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this._title.set(title);
      this._message.set(message);
      this._confirmText.set(options.confirmText || "Confirm");
      this._cancelText.set(options.cancelText || "Cancel");
      this._isDeleting.set(false);
      this._resolveFn = resolve;
      this._visible.set(true);
    });
  }

  onConfirm() {
    if (this._isDeleting()) return;
    this._isDeleting.set(true);
    this._resolveFn?.(true);
    this._resolveFn = null;
    this._visible.set(false);
  }

  onCancel() {
    this._resolveFn?.(false);
    this._resolveFn = null;
    this._visible.set(false);
  }
}