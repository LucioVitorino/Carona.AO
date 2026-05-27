import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, NgIf, ReactiveFormsModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss',
})
export class PasswordInputComponent {
  @Input() control: FormControl | null = null;
  @Input() label = 'Password';
  @Input() placeholder = '';
  @Input() autocomplete = 'current-password';
  @Input() hint = '';
  @Input() showRequirements = false;
  @Input() icon = '';

  visible = false;

  toggleVisibility(): void {
    this.visible = !this.visible;
  }

  hasError(error: string): boolean {
    return Boolean(this.control?.invalid && (this.control?.dirty || this.control?.touched) && this.control?.hasError(error));
  }
}