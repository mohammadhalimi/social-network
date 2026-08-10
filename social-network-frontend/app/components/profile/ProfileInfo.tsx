'use client';

import Image from 'next/image';
import { User } from '@/app/redux/features/authSlice';
import {
  User as UserIcon,
  AtSign,
  Mail,
  FileText,
  Calendar,
} from 'lucide-react';

interface ProfileInfoProps {
  user: User | null;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  if (!user) {
    return (
      <div
        className="
        bg-card
        border
        border-border
        rounded-2xl
        p-6
        shadow-soft
        text-center
        py-12
        ">
        <p
          className="
          text-secondary
          ">اطلاعاتی برای نمایش وجود ندارد.
        </p>
      </div>
    );
  }

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/uploads/')) return `http://localhost:4000${avatar}`;
    return `http://localhost:4000/uploads/${avatar}`;
  };

  const avatarUrl = getAvatarUrl(user.avatar);

  const fields = [
    { label: 'نام کامل', value: user.fullName, icon: UserIcon },
    { label: 'نام کاربری', value: `@${user.username}`, icon: AtSign },
    { label: 'ایمیل', value: user.email, icon: Mail },
    {
      label: 'بیوگرافی',
      value: user.bio || 'هنوز بیوگرافی وارد نشده است',
      icon: FileText,
      muted: !user.bio,
    },
  ];

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
      <div
        className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        gap-5
        pb-6
        mb-6
        border-b
        border-border
        ">
        <div
          className="
          w-20
          h-20
          sm:w-24
          sm:h-24
          rounded-full
          bg-gradient-primary
          flex
          items-center
          justify-center
          shadow-glow-primary
          overflow-hidden
          flex-shrink-0
          mx-auto
          sm:mx-0
          ">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="آواتار"
              className="
              w-full
              h-full
              object-cover"
              width={100}
              height={100}
              unoptimized
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span
            className={`
            text-3xl
            font-bold
            text-white
            ${avatarUrl ? 'hidden' : ''} fallback`}>
            {user.fullName?.[0] || '👤'}
          </span>
        </div>

        <div
          className="
          text-center
          sm:text-right
          min-w-0
          ">
          <h1
            className="
            text-xl
            font-bold
            text-primary
            truncate
            ">
            {user.fullName}
          </h1>
          <p
            className="
            text-secondary
            text-sm
            truncate
            ">
            @{user.username}
          </p>
          <p
            className="
            text-xs
            text-secondary
            mt-1.5
            flex
            items-center
            justify-center
            sm:justify-start
            gap-1.5
            ">
            <Calendar
              className="
              w-3.
              h-3.5"
            />
            عضویت از {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
          </p>
        </div>
      </div>
      <dl
        className="
        divide-y
        divide-border
        ">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div
              key={field.label}
              className="
              grid
              grid-cols-1
              sm:grid-cols-4
              gap-1
              sm:gap-4
              py-4
              first:pt-0
              last:pb-0
              ">
              <dt
                className="
                flex
                items-center
                gap-2
                text-sm
                text-secondary
                sm:col-span-1
                ">
                <Icon
                  className="
                  w-4
                  h-4
                  text-primary/60"
                  />
                {field.label}
              </dt>
              <dd
                className={`
                text-sm
                sm:col-span-3
                font-medium
                ${field.muted ? 'text-text-secondary italic' : 'text-text-primary'}
              `}
              >
                {field.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}