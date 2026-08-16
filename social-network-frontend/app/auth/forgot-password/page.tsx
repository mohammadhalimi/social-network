'use client';

import { useState } from 'react';
import { ForgotPasswordSuccess } from '@/app/components/auth/forgot-password/SuccessMessage';
import { ForgotPasswordForm } from '@/app/components/auth/forgot-password/ForgotPasswordForm';
import { ForgotPasswordLayout } from '@/app/components/auth/forgot-password/ForgotPasswordLayout';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return <ForgotPasswordSuccess />;
  }

  return (
    <ForgotPasswordLayout
      title="فراموشی رمز عبور"
      subtitle="ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود."
      icon="🔒"
    >
      <ForgotPasswordForm onSuccess={() => setIsSubmitted(true)} />
    </ForgotPasswordLayout>
  );
}