'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { REQUEST_PASSWORD_RESET } from '@/app/graphql/auth.queries';
import { ConfirmCircle } from '../../profile/svg/ConfirmCircle';
interface ForgotPasswordFormProps {
    onSuccess: () => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
    const [email, setEmail] = useState('');

    const [requestPasswordReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET);

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('❌ لطفاً ایمیل خود را وارد کنید.');
            return;
        }

        try {
            const result = await requestPasswordReset({ variables: { email } });

            if (result.data?.requestPasswordReset?.success) {
                onSuccess();
                toast.success('✅ لینک بازیابی به ایمیل شما ارسال شد.');
            } else {
                toast.error(result.data?.requestPasswordReset?.message || 'خطا در ارسال لینک بازیابی');
            }
        } catch (error: any) {
            toast.error(error.message || 'خطا در ارسال لینک بازیابی');
        }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="space-y-6
        ">
            <div>
                <label
                    className="
                    block
                    text-sm
                    font-medium
                    text-primary
                    mb-1.5
                ">
                    ایمیل
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                    input-light
                    w-full"
                    placeholder="example@email.com"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="
                btn-primary
                w-full
                text-center
                flex
                items-center
                justify-center
                gap-2
                ">
                {loading ? (
                    <>
                        <ConfirmCircle />
                        در حال ارسال...
                    </>
                ) : (
                    'ارسال لینک بازیابی'
                )}
            </button>

            <div
                className="
                text-center
            ">
                <Link
                    href="/auth/login"
                    className="
                    text-sm
                    text-secondary
                    hover:text-primary
                    transition-colors
                    ">
                    بازگشت به صفحه ورود
                </Link>
            </div>
        </form>
    );
};