import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';
import { CustomSelectComponent } from '../../components/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CustomSelectComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsPageComponent implements OnInit {
  vm = inject(BudgetService);
  private auth = inject(AuthService);

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
    } catch (error: any) {
      this.nameError = error?.message ?? 'Could not save the display name.';
      this.name = this.currentName();
    } finally {
      this.nameSaving = false;
    }
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
