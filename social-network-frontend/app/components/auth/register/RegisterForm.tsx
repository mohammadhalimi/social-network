'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FormInput } from './FormInput';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { SubmitButton } from './SubmitButton';
import { useMutation } from '@apollo/client/react';
import { useAppDispatch } from '@/app/redux/hooks';
import { REGISTER } from '@/app/graphql/auth.queries';
import { RegisterFormData, validateRegisterForm } from './RegisterSchema';
import { authStart, loginSuccess, authFailure } from '@/app/redux/features/authSlice';

export function RegisterForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        defaultValues: {
            email: '',
            username: '',
            password: '',
            fullName: '',
        },
    });

    const [registerMutation] = useMutation(REGISTER);

    const onSubmit = async (data: RegisterFormData) => {
        // ✅ اعتبارسنجی با TypeScript
        const validationError = validateRegisterForm(data);
        if (validationError) {
            setError(validationError);
            toast.error(`❌ ${validationError}`);
            return;
        }

        try {
            setError(null);
            dispatch(authStart());

            const result = await registerMutation({
                variables: data,
            });

            const { success, message, user } = result.data?.register || {};

            if (success && user) {
                dispatch(loginSuccess({ user }));
                toast.success('✅ ثبت‌نام شما با موفقیت انجام شد!');
                setTimeout(() => {
                    router.push('/auth/login');
                }, 3000);
            } else {
                const errMsg = message || 'خطا در ثبت‌نام';
                dispatch(authFailure(errMsg));
                setError(errMsg);
                toast.error(`❌ ${errMsg}`);
            }
        } catch (err: any) {
            const errorMsg = err.message || 'خطا در ثبت‌نام';
            dispatch(authFailure(errorMsg));
            setError(errorMsg);
            toast.error(`❌ ${errorMsg}`);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
                <div
                    className="
                bg-red-50
                border
                border-red-400
                text-red-700
                px-4
                py-3
                rounded-lg
                text-s
                ">
                    {error}
                </div>
            )}
            <FormInput
                label="ایمیل"
                type="email"
                placeholder="example@email.com"
                register={register('email', { required: 'ایمیل الزامی است' })}
                error={errors.email?.message}
            />

            <FormInput
                label="نام کاربری"
                type="text"
                placeholder="username"
                register={register('username', { required: 'نام کاربری الزامی است' })}
                error={errors.username?.message}
            />

            <FormInput
                label="نام کامل"
                type="text"
                placeholder="نام و نام خانوادگی"
                register={register('fullName', { required: 'نام کامل الزامی است' })}
                error={errors.fullName?.message}
            />

            <FormInput
                label="رمز عبور"
                type="password"
                placeholder="••••••••"
                register={register('password', {
                    required: 'رمز عبور الزامی است',
                    minLength: {
                        value: 8,
                        message: 'رمز عبور باید حداقل ۸ کاراکتر باشد'
                    }
                })}
                error={errors.password?.message}
                showPasswordHint={true}
                helpText="حداقل ۸ کاراکتر، شامل حروف بزرگ، کوچک، عدد و کاراکتر خاص"
            />

            <SubmitButton isSubmitting={isSubmitting} />

            <div className="text-center">
                <Link
                    href="/auth/login"
                    className="
                text-sm
                text-text-secondary
                hover:text-primary
                transition-colors
                ">
                    قبلاً حساب دارید؟
                    <span
                        className="
                    text-primary
                    font-semibold
                    ">
                        وارد شوید
                    </span>
                </Link>
            </div>
        </form>
    );
}