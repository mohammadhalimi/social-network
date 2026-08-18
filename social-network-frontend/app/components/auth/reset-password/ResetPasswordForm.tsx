'use client';

import { z } from 'zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FormInput } from '../FormInput';
import { useForm } from 'react-hook-form';
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

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

interface ResetPasswordFormProps {
    token: string;
    onSuccess: () => void;
}

export const ResetPasswordForm = ({ token, onSuccess }: ResetPasswordFormProps) => {
    const router = useRouter();
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const password = watch('password');

    const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);

    const validatePassword = (value: string) => {
        try {
            passwordSchema.parse(value);
            setPasswordError(null);
            clearErrors('password');
            return true;
        } catch (error: any) {
            const errorMessage = error.errors[0]?.message || 'رمز عبور معتبر نیست';
            setPasswordError(errorMessage);
            setError('password', { type: 'manual', message: errorMessage });
            return false;
        }
    };

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('❌ لینک نامعتبر است.');
            return;
        }

        if (data.password !== data.confirmPassword) {
            toast.error('❌ رمز عبور با تکرار آن مطابقت ندارد.');
            return;
        }

        if (!validatePassword(data.password)) {
            return;
        }

        try {
            const result = await resetPassword({
                variables: { token, newPassword: data.password },
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
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="
        space-y-6
        ">
            <FormInput
                label="رمز عبور جدید"
                type="password"
                placeholder="••••••••"
                register={register('password', {
                    required: 'رمز عبور جدید الزامی است',
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        validatePassword(e.target.value);
                    },
                })}
                error={passwordError || errors.password?.message}
                required
            />

            <FormInput
                label="تکرار رمز عبور جدید"
                type="password"
                placeholder="••••••••"
                register={register('confirmPassword', {
                    required: 'تکرار رمز عبور الزامی است',
                    validate: (value: string) =>
                        value === password || 'رمز عبور با تکرار آن مطابقت ندارد',
                })}
                error={errors.confirmPassword?.message}
                required
            />

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