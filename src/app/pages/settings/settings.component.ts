import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';
import { CustomSelectComponent } from '../../components/ui/custom-select/custom-select.component';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CustomSelectComponent, TooltipDirective],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsPageComponent implements OnInit {
  vm = inject(BudgetService);
  readonly auth = inject(AuthService);

  /** Editable copy of the account's display name. */
  name = '';
  nameSaving = false;
  nameError = '';

  ngOnInit(): void {
    this.name = this.currentName();
  }

  get nameChanged(): boolean {
    return this.name.trim() !== this.currentName();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.nameChanged) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  async saveName(): Promise<void> {
    const next = this.name.trim();

    if (!next || !this.nameChanged || this.nameSaving) {
      this.name = this.currentName();
      return;
    }

    this.nameSaving = true;
    this.nameError = '';

    try {
      await this.auth.updateProfile(this.vm.settings().apiBaseUrl, next);
      this.vm.updateSetting({ name: next });
      this.name = this.currentName();
      this.vm.notify('Display name updated');
    } catch (error: any) {
      this.nameError = error?.message ?? 'Could not save the display name.';
      this.vm.notify(this.nameError, 'error');
    } finally {
      this.nameSaving = false;
    }
  }

  updateCurrency(currency: string): void {
    if (currency === this.vm.settings().currency) return;
    this.vm.updateSetting({ currency });
    this.vm.notify('Currency updated');
  }

  updateTheme(theme: 'light' | 'dark'): void {
    if (theme === this.vm.settings().theme) return;
    this.vm.updateSetting({ theme });
    this.vm.notify(theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled');
  }

  toggleNotifications(): void {
    const next = !this.vm.settings().notifications;
    this.vm.updateSetting({ notifications: next });
    this.vm.notify(next ? 'Weekly check-in enabled' : 'Weekly check-in disabled');
  }

  updateApiBaseUrl(apiBaseUrl: string): void {
    if (apiBaseUrl === this.vm.settings().apiBaseUrl) return;
    this.vm.updateSetting({ apiBaseUrl });
  }

  get email(): string {
    return this.auth.user()?.email ?? '';
  }

  getInitials(name?: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  /** The signed-in user's name — same source as the sidebar and header. */
  private currentName(): string {
    return (
      this.auth.user()?.fullName?.trim() ||
      this.vm.settings().name?.trim() ||
      'User'
    );
  }
}
