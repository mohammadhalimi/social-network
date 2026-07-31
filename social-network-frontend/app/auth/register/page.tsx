'use client';

import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { REGISTER, RegisterResponse, RegisterVariables } from '@/app/graphql/auth.queries';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppDispatch } from '@/app/redux/hooks';
import { authStart, loginSuccess, authFailure } from '@/app/redux/features/authSlice';
import Link from 'next/link';

// ✅ اعتبارسنجی با Zod
const registerSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  username: z.string().min(3, 'نام کاربری حداقل ۳ کاراکتر'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
  fullName: z.string().min(3, 'نام کامل حداقل ۳ کاراکتر'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [registerMutation] = useMutation<RegisterResponse, RegisterVariables>(REGISTER);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      dispatch(authStart());

      const result = await registerMutation({
        variables: data,
      });

      const { success, message, user } = result.data?.register || {};

      if (success && user) {
        dispatch(loginSuccess({ user }));
        router.push('/');
      } else {
        const errMsg = message || 'خطا در ثبت‌نام';
        dispatch(authFailure(errMsg));
        setError(errMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'خطا در ثبت‌نام';
      dispatch(authFailure(errorMsg));
      setError(errorMsg);
    }
  };

  // ✅ return باید اینجا باشه (بعد از همه تعاریف، داخل کامپوننت)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            ثبت‌نام
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            عضو جدید؟ همین حالا ثبت‌نام کن
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                ایمیل
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                نام کاربری
              </label>
              <input
                {...register('username')}
                type="text"
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                نام کامل
              </label>
              <input
                {...register('fullName')}
                type="text"
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="نام و نام خانوادگی"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                رمز عبور
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              قبلاً حساب دارید؟ وارد شوید
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}