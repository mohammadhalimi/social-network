'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { ConfirmCircle } from './svg/ConfirmCircle';
import {
  CHANGE_PASSWORD,
  ChangePasswordResponse,
  ChangePasswordVariables
} from '@/app/graphql/profile.queries';


import PasswordField from './PasswordField';

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');
  const [changePassword] = useMutation<ChangePasswordResponse, ChangePasswordVariables>(CHANGE_PASSWORD);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      const result = await changePassword({
        variables: { oldPassword: data.oldPassword, newPassword: data.newPassword },
      });

      const { success, message } = result.data?.changePassword || {};

      if (success) {
        toast.success('رمز عبور با موفقیت تغییر یافت');
      } else {
        toast.error(message || 'خطا در تغییر رمز عبور');
      }
    } catch (error: any) {
      toast.error(error.message || 'خطا در تغییر رمز عبور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="card"
    >
      <h1
        className="text-xl
      sm:text-2xl
      font-bold
      text-text-primary
      mb-1"
      >
        تغییر رمز عبور
      </h1>
      <p
        className="text-sm
      text-text-secondary
      mb-6"
      >
        برای امنیت بیشتر، رمز عبور قوی و منحصربه‌فرد انتخاب کن
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
      space-y-5
      max-w-md"
      >
        <div>
          <label
            className="
          block
          text-sm
          font-medium
          text-text-primary
          mb-1.5"
          >
            رمز عبور فعلی
          </label>
          <PasswordField
            register={register('oldPassword', { required: 'رمز عبور فعلی الزامی است' })}
            placeholder="••••••••"
            visible={showOld}
            onToggle={() => setShowOld((v) => !v)}
          />
          {errors.oldPassword
            &&
            <p
              className="
          text-red-500
          text-xs
          mt-1"
            >
              {errors.oldPassword.message}
            </p>}
        </div>
        <div>
          <label
            className="
          block
          text-sm
          font-medium
          text-text-primary
          mb-1.5"
          >
            رمز عبور جدید
          </label>
          <PasswordField
            register={register('newPassword', {
              required: 'رمز عبور جدید الزامی است',
              minLength: { value: 8, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' },
            })}
            placeholder="••••••••"
            visible={showNew}
            onToggle={() => setShowNew((v) => !v)}
          />
          {errors.newPassword ? (
            <p
              className="
            text-red-500
            text-xs
            mt-1"
            >
              {errors.newPassword.message}
            </p>
          ) : (
            <p
              className="
            text-xs
            text-text-secondary
            mt-1"
            >
              حداقل ۸ کاراکتر
            </p>
          )}
        </div>

        <div>
          <label
            className="
          block
          text-sm
          font-medium
          text-text-primary
          mb-1.5"
          >
            تکرار رمز عبور جدید
          </label>
          <PasswordField
            register={register('confirmPassword', {
              required: 'تکرار رمز عبور الزامی است',
              validate: (value: string) => value === newPassword || 'رمز عبور با تکرار آن مطابقت ندارد',
            })}
            placeholder="••••••••"
            visible={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
          />
          {errors.confirmPassword
            &&
            <p
              className="
          text-red-500
          text-xs
          mt-1"
            >
              {errors.confirmPassword.message}
            </p>
          }
        </div>

        <div
          className="
        flex
        justify-end
        pt-2"
        >
          <motion.button
            type="submit"
            disabled={isLoading}
            className="btn-primary
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