'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { FormInput } from '../FormInput';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { ConfirmCircle } from '../../profile/svg/ConfirmCircle';
import { REQUEST_PASSWORD_RESET } from '@/app/graphql/auth.queries';

interface ForgotPasswordFormData {
    email: string;
}

interface ForgotPasswordFormProps {
    onSuccess: () => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
    // ✅ استفاده از useForm (بدون state اضافی)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        defaultValues: {
            email: '',
        },
    });

    const [requestPasswordReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const result = await requestPasswordReset({ variables: { email: data.email } });

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
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6
        ">
            <FormInput
                label="ایمیل"
                type="email"
                placeholder="example@email.com"
                register={register('email', { required: 'ایمیل الزامی است' })}
                error={errors.email?.message}
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
                        در حال ارسال...
                    </>
                ) : (
                    'ارسال لینک بازیابی'
                )}
            </button>

            <div className="text-center">
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