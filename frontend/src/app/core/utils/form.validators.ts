import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = control.value ?? '';

  if (value.length === 0) {
    return null;
  }

  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };

  return Object.values(checks).every(Boolean) ? null : { strongPassword: checks };
}

export function matchFieldsValidator(firstKey: string, secondKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const first = control.get(firstKey)?.value;
    const second = control.get(secondKey)?.value;

    if (!first || !second || first === second) {
      return null;
    }

    return { fieldsMismatch: true };
  };
}