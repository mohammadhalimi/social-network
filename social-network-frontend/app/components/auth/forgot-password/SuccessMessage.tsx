'use client';

import { SuccessMessage as BaseSuccessMessage } from '@/app/components/auth/SuccessMessage';

export const ForgotPasswordSuccess = () => (
  <BaseSuccessMessage
    icon="📧"
    title="ایمیل ارسال شد!"
    message="لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً ایمیل خود را بررسی کنید."
    buttonText="بازگشت به صفحه ورود"
    buttonLink="/auth/login"
  />
);