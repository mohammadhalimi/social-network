// ✅ تعریف نوع‌ها با TypeScript
export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

// ✅ تابع اعتبارسنجی با پیام‌های دقیق‌تر
export const validateRegisterForm = (data: RegisterFormData): string | null => {
  if (!data.email || !data.email.includes('@')) {
    return 'ایمیل نامعتبر است';
  }
  if (data.username.length < 3) {
    return 'نام کاربری حداقل ۳ کاراکتر';
  }
  if (data.password.length < 8) {
    return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
  }
  if (!/[a-z]/.test(data.password)) {
    return 'رمز عبور باید حداقل یک حرف کوچک داشته باشد (a-z)';
  }
  if (!/[A-Z]/.test(data.password)) {
    return 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد (A-Z)';
  }
  if (!/[0-9]/.test(data.password)) {
    return 'رمز عبور باید حداقل یک عدد داشته باشد (0-9)';
  }
  if (!/[^a-zA-Z0-9]/.test(data.password)) {
    return 'رمز عبور باید حداقل یک کاراکتر خاص داشته باشد (مثلاً: @, #, $, %, &, *, !, ?, _, -, +, =)';
  }
  if (data.fullName.length < 3) {
    return 'نام کامل حداقل ۳ کاراکتر';
  }
  return null;
};

// ✅ لیست کاراکترهای خاص مجاز (برای نمایش به کاربر)
export const SPECIAL_CHARS = '@ # $ % & * ! ? _ - + =';