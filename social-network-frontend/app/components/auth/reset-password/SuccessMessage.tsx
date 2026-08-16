'use client';

import { SuccessMessage as BaseSuccessMessage } from '@/app/components/auth/SuccessMessage';

export const ResetPasswordSuccess = () => (
  <BaseSuccessMessage
    icon="✅"
    title="رمز عبور تغییر یافت!"
    message="رمز عبور شما با موفقیت تغییر یافت. در حال انتقال به صفحه ورود..."
    buttonText="رفتن به صفحه ورود"
    buttonLink="/auth/login"
  />
);