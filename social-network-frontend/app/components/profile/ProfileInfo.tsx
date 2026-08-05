'use client';

import Image from 'next/image';
import { User } from '@/app/redux/features/authSlice';

interface ProfileInfoProps {
  user: User | null;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  if (!user) {
    return (
      <div
        className="card
      text-center
      py-12
      ">
        <p
          className="
        text-text-secondary
        ">
          اطلاعاتی برای نمایش وجود ندارد.
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
    { label: 'نام کامل', value: user.fullName },
    { label: 'نام کاربری', value: `@${user.username}` },
    { label: 'ایمیل', value: user.email },
    {
      label: 'بیوگرافی',
      value: user.bio || 'هنوز بیوگرافی وارد نشده است',
      muted: !user.bio,
    },
  ];

  return (
    <div
      className="card"
    >
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
      border-gray-100
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
          <span className={`text-3xl font-bold text-white ${avatarUrl ? 'hidden' : ''} fallback`}>
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
          text-text-primary
          truncate">
            {user.fullName}
          </h1>
          <p
            className="
          text-text-secondary
          text-sm truncate
          ">
            @{user.username}
          </p>
          <p
            className="text-xs
          text-text-secondary
          mt-1.5
          ">
            عضویت از {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
          </p>
        </div>
      </div>
      <dl
        className="
      divide-y
      divide-gray-100
      ">
        {fields.map((field) => (
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
            text-sm
            text-text-secondary
            sm:col-span-1
            ">
              {field.label}
            </dt>
            <dd
              className={`
                text-sm
                sm:col-span-3
                font-medium
                ${field.muted
                  ?
                  'text-text-secondary italic'
                  :
                  'text-text-primary'
                }`}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}