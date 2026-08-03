export interface LoginFormData {
  email: string;
  password: string;
}

export const validateLoginForm = (data: LoginFormData): string | null => {
  if (!data.email || !data.email.includes('@')) {
    return 'ایمیل نامعتبر است';
  }
  if (data.password.length < 6) {
    return 'رمز عبور حداقل ۶ کاراکتر';
  }
  return null;
};