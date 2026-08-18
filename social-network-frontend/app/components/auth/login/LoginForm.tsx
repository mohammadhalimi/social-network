'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FormInput } from '../FormInput';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { SubmitButton } from './SubmitButton';
import { LoginFormData } from './LoginSchema';
import { useMutation } from '@apollo/client/react';
import { useAppDispatch } from '@/app/redux/hooks';
import { LOGIN } from '@/app/graphql/auth.queries';
import {
  authStart,
  loginSuccess,
  authFailure
} from '@/app/redux/features/authSlice';

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

  const [loginMutation] = useMutation(LOGIN);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      dispatch(authStart());

      const result = await loginMutation({
        variables: data,
      });

      if (result.data?.login) {
        const { success, message, user, token } = result.data.login;

        if (success && user && token) {
          dispatch(loginSuccess({
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              fullName: user.fullName,
              bio: user.bio || null,
              avatar: user.avatar || null,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
            token,
          }));
          toast.success(`✅ خوش آمدید ${user.fullName}!`);
          router.push('/profile');
        } else {
          const errMsg = message || 'خطا در ورود';
          dispatch(authFailure(errMsg));
          setError(errMsg);
          toast.error(`❌ ${errMsg}`);
        }
      } else {
        throw new Error('پاسخی از سرور دریافت نشد.');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'خطا در ورود';
      dispatch(authFailure(errorMsg));
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
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
          text-sm">
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
        required
      />

      <FormInput
        label="رمز عبور"
        type="password"
        placeholder="••••••••"
        register={register('password', {
          required: 'رمز عبور الزامی است',
          minLength: { value: 6, message: 'رمز عبور حداقل ۶ کاراکتر' }
        })}
        error={errors.password?.message}
        delay={0.2}
        required
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
          text-secondary
          hover:text-primary
          transition-colors
          ">
          حساب ندارید؟ <span
            className="
            text-primary
            font-semibold
            ">ثبت‌نام کنید
          </span>
        </Link>
      </motion.div>
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/auth/forgot-password"
          className="
          text-sm
          text-secondary
          hover:text-primary
          transition-colors
          ">
          رمز عبور خود را فراموش کرده اید ؟
        </Link>
      </motion.div>
    </motion.form>
  );
}