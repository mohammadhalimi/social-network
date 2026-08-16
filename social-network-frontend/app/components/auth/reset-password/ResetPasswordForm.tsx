'use client';

import { z } from 'zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { RESET_PASSWORD } from '@/app/graphql/auth.queries';
import { ConfirmCircle } from '../../profile/svg/ConfirmCircle';
// ✅ اعتبارسنجی رمز عبور
const passwordSchema = z.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد')
    .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
    .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد')
    .regex(/[^a-zA-Z0-9]/, 'رمز عبور باید حداقل یک کاراکتر خاص داشته باشد');

interface ResetPasswordFormProps {
    token: string;
    onSuccess: () => void;
}

export const ResetPasswordForm = ({ token, onSuccess }: ResetPasswordFormProps) => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);

    const validatePassword = (value: string) => {
        try {
            passwordSchema.parse(value);
            setPasswordError(null);
            return true;
        } catch (error: any) {
            setPasswordError(error.errors[0]?.message || 'رمز عبور معتبر نیست');
            return false;
        }
    };

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('❌ لینک نامعتبر است.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('❌ رمز عبور با تکرار آن مطابقت ندارد.');
            return;
        }

        if (!validatePassword(password)) {
            return;
        }

        try {
            const result = await resetPassword({
                variables: { token, newPassword: password },
            });

            if (result.data?.resetPassword?.success) {
                onSuccess();
                toast.success('✅ رمز عبور با موفقیت تغییر یافت!');
                setTimeout(() => {
                    router.push('/auth/login');
                }, 3000);
            } else {
                toast.error(result.data?.resetPassword?.message || 'خطا در بازنشانی رمز عبور');
            }
        } catch (error: any) {
            toast.error(error.message || 'خطا در بازنشانی رمز عبور');
        }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="
            space-y-6
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
                    رمز عبور جدید
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                    }}
                    className="
                    input-light
                    w-full"
                    placeholder="••••••••"
                    required
                />
                {passwordError && (
                    <p
                        className="
                        text-red-500
                        text-xs
                        mt-1
                    ">
                        {passwordError}
                    </p>
                )}
            </div>

            <div>
                <label
                    className="
                    block
                    text-sm
                    font-medium
                    text-primary
                    mb-1.5
                ">
                    تکرار رمز عبور جدید
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-light w-full"
                    placeholder="••••••••"
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
                        در حال تغییر...
                    </>
                ) : (
                    'تغییر رمز عبور'
                )}
            </button>
        </form>
    );
};