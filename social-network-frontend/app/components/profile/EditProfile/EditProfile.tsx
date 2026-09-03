'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FormField } from './FormField';
import { useForm } from 'react-hook-form';
import { AvatarUpload } from './AvatarUpload';
import { SubmitButton } from './SubmitButton';
import { useMutation } from '@apollo/client/react';
import { useAppDispatch } from '@/app/redux/hooks';
import { User } from '@/app/redux/features/authSlice';
import { updateUser } from '@/app/redux/features/authSlice';
import { UPDATE_PROFILE } from '@/app/graphql/profile.queries';

interface EditProfileFormData {
  username: string;
  fullName: string;
  email: string;
  bio: string;
  avatar: string;
}

interface EditProfileProps {
  user: User | null;
}

export const EditProfileForm = ({ user }: EditProfileProps) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      fullName: user?.fullName || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    },
    mode: 'onChange',
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const handleFileChange = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم عکس باید کمتر از ۵ مگابایت باشد.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('فرمت عکس پشتیبانی نمی‌شود. فقط JPG, PNG, GIF, WEBP مجاز هستند.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('http://localhost:4000/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPreviewAvatar(result.url);
        setValue('avatar', result.url);
        toast.success('عکس با موفقیت آپلود شد');
      } else {
        toast.error(result.error || 'خطا در آپلود عکس');
      }
    } catch (error: any) {
      toast.error(error.message || 'خطا در آپلود عکس');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewAvatar(null);
    setValue('avatar', '');
  };

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsLoading(true);
      const result = await updateProfile({ variables: data });

      const { success, message, user: updatedUser } = result.data?.updateProfile || {};

      if (success && updatedUser) {
        dispatch(updateUser(updatedUser));
        toast.success('پروفایل با موفقیت به‌روزرسانی شد');
      } else {
        toast.error(message || 'خطا در به‌روزرسانی');
      }
    } catch (error: any) {
      toast.error(error.message || 'خطا در به‌روزرسانی');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AvatarUpload
          previewAvatar={previewAvatar}
          isUploading={isUploading}
          fullName={user?.fullName}
          onFileChange={handleFileChange}
          onRemove={handleRemoveAvatar}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="نام کامل" error={errors.fullName?.message}>
            <input
              {...register('fullName', { required: 'نام کامل الزامی است' })}
              type="text"
              className="input-light"
              placeholder="نام و نام خانوادگی"
            />
          </FormField>

          <FormField
            label="نام کاربری"
            error={errors.username?.message}
          >
            <input
              {...register('username', {
                required: 'نام کاربری الزامی است',
                validate: {
                  onlyEnglish: (value) =>
                    /^[a-zA-Z0-9]*$/.test(value) ||
                    'نام کاربری فقط باید شامل حروف انگلیسی و اعداد باشد',
                  notStartWithNumber: (value) =>
                    !/^[0-9]/.test(value) ||
                    'نام کاربری نباید با عدد شروع شود',
                  minLength: (value) =>
                    value.length >= 4 ||
                    'نام کاربری باید حداقل ۴ کاراکتر باشد',
                },
              })}
              type="text"
              className="input-light"
              placeholder="username"
            />
          </FormField>
        </div>

        <FormField label="ایمیل" error={errors.email?.message}>
          <input
            {...register('email', {
              required: 'ایمیل الزامی است',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'ایمیل نامعتبر است',
              },
            })}
            type="email"
            className="input-light"
            placeholder="example@email.com"
          />
        </FormField>

        <FormField label="بیوگرافی" optional>
          <textarea
            {...register('bio')}
            rows={4}
            className="input-light resize-none"
            placeholder="درباره خودت بنویس..."
          />
        </FormField>

        <SubmitButton isLoading={isLoading} isUploading={isUploading} />
      </form>
    </div>
  );
};