'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import PasswordField from './PasswordField';
import { useMutation } from '@apollo/client/react';
import { ConfirmCircle } from './svg/ConfirmCircle';
import { CHANGE_PASSWORD } from '@/app/graphql/profile.queries';
import {
  validateRegisterForm,
  SPECIAL_CHARS
}
  from '../auth/register/RegisterSchema';

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset, // ✅ اضافه کردن reset
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  // ✅ اعتبارسنجی رمز عبور جدید
  const handlePasswordChange = (value: string) => {
    const mockData = {
      email: 'test@test.com',
      username: 'test',
      password: value,
      fullName: 'test',
    };

    const error = validateRegisterForm(mockData);

    if (error) {
      setPasswordErrors([error]);
      setError('newPassword', {
        type: 'manual',
        message: error,
      });
    } else {
      setPasswordErrors([]);
      clearErrors('newPassword');
    }
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    // ✅ بررسی نهایی رمز عبور جدید
    const mockData = {
      email: 'test@test.com',
      username: 'test',
      password: data.newPassword,
      fullName: 'test',
    };
    const validationError = validateRegisterForm(mockData);

    if (validationError) {
      toast.error(`❌ ${validationError}`);
      return;
    }

    // ✅ بررسی تطابق رمز عبور
    if (data.newPassword !== data.confirmPassword) {
      toast.error('❌ رمز عبور با تکرار آن مطابقت ندارد');
      return;
    }

    try {
      setIsLoading(true);
      const result = await changePassword({
        variables: { oldPassword: data.oldPassword, newPassword: data.newPassword },
      });

      const { success, message } = result.data?.changePassword || {};

      if (success) {
        toast.success('✅ رمز عبور با موفقیت تغییر یافت');

        // ✅ ریست کامل فرم
        reset({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // ✅ ریست stateهای نمایش رمز
        setShowOld(false);
        setShowNew(false);
        setShowConfirm(false);
        setPasswordErrors([]);
      } else {
        toast.error(`❌ ${message || 'خطا در تغییر رمز عبور'}`);
      }
    } catch (error: any) {
      toast.error(`❌ ${error.message || 'خطا در تغییر رمز عبور'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordError = (): string | null => {
    if (errors.newPassword?.message) {
      return errors.newPassword.message;
    }
    return null;
  };

  const passwordError = getPasswordError();

  return (
    <div
      className="
      bg-card
      border
      border-border
      rounded-2xl
      p-6
      shadow-soft
      ">
      <h1
        className="
        text-xl
        sm:text-2xl
        font-bold
        text-primary
        mb-1
        ">
        🔒 تغییر رمز عبور
      </h1>
      <p
        className="
        text-sm
        text-secondary
        mb-6
        ">
        برای امنیت بیشتر، رمز عبور قوی و منحصربه‌فرد انتخاب کن
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
        space-y-5
        max-w-md
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
            رمز عبور فعلی
          </label>
          <PasswordField
            register={register('oldPassword', {
              required: 'رمز عبور فعلی الزامی است'
            })}
            placeholder="••••••••"
            visible={showOld}
            onToggle={() => setShowOld((v) => !v)}
          />
          {errors.oldPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.oldPassword.message}
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
            رمز عبور جدید
          </label>
          <PasswordField
            register={register('newPassword', {
              required: 'رمز عبور جدید الزامی است',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                handlePasswordChange(e.target.value),
            })}
            placeholder="••••••••"
            visible={showNew}
            onToggle={() => setShowNew((v) => !v)}
          />

          {passwordError ? (
            <p
              className="
              text-red-500
              text-xs
              mt-1
              ">
              {passwordError}
            </p>
          ) : (
            <div
              className="
              mt-1
              ">
              <p
                className="
                text-xs
                text-secondary
                ">
                رمز عبور باید شامل موارد زیر باشد:
              </p>
              <ul
                className="
                text-xs
                text-secondary
                mt-1
                space-y-0.5
                list-disc
                list-inside
                ">
                <li
                  className={passwordErrors.some(e => e.includes('۸ کاراکتر'))
                    ? 'text-red-500'
                    : 'text-green-500'}>
                  حداقل ۸ کاراکتر
                </li>
                <li
                  className={passwordErrors.some(e => e.includes('حرف کوچک'))
                    ? 'text-red-500'
                    : 'text-green-500'}>
                  حداقل یک حرف کوچک (a-z)
                </li>
                <li
                  className={passwordErrors.some(e => e.includes('حرف بزرگ'))
                    ? 'text-red-500'
                    : 'text-green-500'}>
                  حداقل یک حرف بزرگ (A-Z)
                </li>
                <li
                  className={passwordErrors.some(e => e.includes('عدد'))
                    ? 'text-red-500'
                    : 'text-green-500'}>
                  حداقل یک عدد (0-9)
                </li>
                <li
                  className={passwordErrors.some(e => e.includes('کاراکتر خاص'))
                    ? 'text-red-500'
                    : 'text-green-500'}>
                  حداقل یک کاراکتر خاص ({SPECIAL_CHARS})
                </li>
              </ul>
            </div>
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
          <PasswordField
            register={register('confirmPassword', {
              required: 'تکرار رمز عبور الزامی است',
              validate: (value: string) =>
                value === newPassword || 'رمز عبور با تکرار آن مطابقت ندارد',
            })}
            placeholder="••••••••"
            visible={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
          />
          {errors.confirmPassword && (
            <p
              className="
              text-red-500
              text-xs mt-1
              ">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div
          className="
          flex
          justify-end
          pt-2
          ">
          <motion.button
            type="submit"
            disabled={isLoading}
            className="
            btn-primary
            w-full
            sm:w-auto
            sm:px-10
            flex
            items-center
            justify-center
            gap-2"
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <ConfirmCircle />
                در حال تغییر...
              </>
            ) : (
              'تغییر رمز عبور'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}