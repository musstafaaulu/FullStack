import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ✅ Email format validator
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(value);

    return valid ? null : { invalidEmail: { message: 'Geçerli bir e-posta adresi giriniz.' } };
  };
}

// ✅ Şifre güç validator
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    if (value.length < 6) {
      return { weakPassword: { message: 'Şifre en az 6 karakter olmalıdır.' } };
    }
    return null;
  };
}

// ✅ Şifre eşleşme validator (group level)
export function passwordMatchValidator(passwordField: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordField)?.value;
    const confirm  = group.get(confirmField)?.value;

    if (password && confirm && password !== confirm) {
      return { passwordMismatch: { message: 'Şifreler eşleşmiyor.' } };
    }
    return null;
  };
}