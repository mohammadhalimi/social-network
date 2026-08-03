'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import  { FormInput }  from './FormInput';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { SubmitButton } from './SubmitButton';
import { useMutation } from '@apollo/client/react';
import { useAppDispatch } from '@/app/redux/hooks';
import { LoginFormData, validateLoginForm } from './LoginSchema';
import { LOGIN, LoginResponse, LoginVariables } from '@/app/graphql/auth.queries';
import { authStart, loginSuccess, authFailure } from '@/app/redux/features/authSlice';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [loginMutation] = useMutation<LoginResponse, LoginVariables>(LOGIN);

  const onSubmit = async (data: LoginFormData) => {
    const validationError = validateLoginForm(data);
    if (validationError) {
      setError(validationError);
      toast.error(`❌ ${validationError}`);
      return;
    }

    try {
      setError(null);
      dispatch(authStart());

      const result = await loginMutation({
        variables: data,
      });

      const { success, message, user } = result.data?.login || {};

      if (success && user) {
        dispatch(loginSuccess({ user }));
        toast.success(`✅ خوش آمدید ${user.fullName}!`);
        router.push('/profile');
      } else {
        const errMsg = message || 'خطا در ورود';
        dispatch(authFailure(errMsg));
        setError(errMsg);
        toast.error(`❌ ${errMsg}`);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'خطا در ورود';

      // بررسی خطای کاربر ثبت‌نام نشده
      if (errorMsg.includes('کاربری با این ایمیل یافت نشد')) {
        toast.error('❌ کاربری با این ایمیل ثبت‌نام نکرده است. لطفاً ابتدا ثبت‌نام کنید.');
      } else {
        toast.error(`❌ ${errorMsg}`);
      }

      dispatch(authFailure(errorMsg));
      setError(errorMsg);
    }
  };

  return (
    <motion.form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      noValidate
      transition={{ duration: 0.5 }}
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="
          bg-red-50
          border
          border-red-200
          text-red-700
          px-4
          py-3
          rounded-xl
          text-sm
          ">
          {error}
        </motion.div>
      )}

      <FormInput
        label="ایمیل"
        type="email"
        placeholder="example@email.com"
        register={register('email', { required: 'ایمیل الزامی است' })}
        error={errors.email?.message}
        delay={0.1}
      />

      <FormInput
        label="رمز عبور"
        type="password"
        placeholder="••••••••"
        register={register('password', {
          required: 'رمز عبور الزامی است',
          minLength: {
            value: 6,
            message: 'رمز عبور حداقل ۶ کاراکتر',
          },
        })}
        error={errors.password?.message}
        delay={0.2}
      />

      <SubmitButton isSubmitting={isSubmitting} />

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/auth/register"
          className="
          text-sm
          text-text-secondary
          hover:text-primary
          transition-colors
          ">
          حساب ندارید؟ <span className="
          text-primary
          font-semibold
          ">
            ثبت‌نام کنید
          </span>
        </Link>
      </motion.div>
    </motion.form>
  );
}