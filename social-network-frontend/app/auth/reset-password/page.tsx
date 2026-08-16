'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordSuccess } from '@/app/components/auth/reset-password/SuccessMessage';
import { ResetPasswordForm } from '@/app/components/auth/reset-password/ResetPasswordForm';
import { ResetPasswordLayout } from '@/app/components/auth/reset-password/ResetPasswordLayout';
import { InvalidTokenMessage } from '@/app/components/auth/reset-password/InvalidTokenMessage';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ بررسی توکن
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }
    // می‌توانید با query `validateResetToken` توکن را بررسی کنید
    setIsValidToken(true);
  }, [token]);

  // =============================================
  //  حالت‌های مختلف
  // =============================================
  if (isValidToken === false) {
    return <InvalidTokenMessage />;
  }

  if (isSubmitted) {
    return <ResetPasswordSuccess />;
  }

  return (
    <ResetPasswordLayout
      title="تنظیم رمز عبور جدید"
      subtitle="رمز عبور جدید خود را وارد کنید."
      icon="🔑"
    >
      <ResetPasswordForm
        token={token || ''}
        onSuccess={() => setIsSubmitted(true)}
      />
    </ResetPasswordLayout>
  );
}