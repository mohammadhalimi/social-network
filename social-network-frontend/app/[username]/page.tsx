'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { FOLLOW_USER, GET_USER_BY_USERNAME } from '@/app/graphql/user.queries';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, User, FileText } from 'lucide-react';
import { FollowButton } from '../components/UserName/FollowButton';
import { ProfilePostsList } from '../components/UserName/ProfilePostsList';

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;

    const { data, loading, error } = useQuery(GET_USER_BY_USERNAME, {
        variables: { username },
        skip: !username,
    });
    // ✅ آمار فالو رو به‌صورت لوکال نگه می‌داریم تا بعد از فالو/آنفالو فوراً آپدیت بشه
    const [followersCount, setFollowersCount] = useState<number | null>(null);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-text-secondary">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error || !data?.getUserByUsername) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">کاربر یافت نشد</h2>
                    <p className="text-text-secondary">کاربری با این نام کاربری وجود ندارد.</p>
                    <Link href="/search" className="btn-primary mt-6 inline-block">
                        بازگشت به جستجو
                    </Link>
                </div>
            </div>
        );
    }

    const user = data.getUserByUsername;
    const displayedFollowersCount = followersCount ?? user.followersCount;

    const getAvatarUrl = (avatar: string | null) => {
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        if (avatar.startsWith('/uploads/')) return `http://localhost:4000${avatar}`;
        return `http://localhost:4000/uploads/${avatar}`;
    };

    const avatarUrl = getAvatarUrl(user.avatar);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mb-6">
                {/* هدر پروفایل */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 mb-6 border-b border-border">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-primary overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                                width={100}
                                height={100}
                                unoptimized
                            />
                        ) : (
                            <span className="text-4xl font-bold text-white">
                                {user.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-right">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">{user.fullName}</h1>
                                <p className="text-text-secondary text-sm">@{user.username}</p>
                                <p className="text-xs text-text-secondary mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    عضویت از {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                                </p>
                            </div>

                            <FollowButton
                                userId={user.id}
                                initialIsFollowing={user.isFollowing}
                                onFollowChange={(_, newCount) => setFollowersCount(newCount)}
                            />
                        </div>

                        {/* ✅ آمار فالوئر/فالووینگ */}
                        <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
                            <div className="text-center sm:text-right">
                                <p className="font-bold text-text-primary">{displayedFollowersCount}</p>
                                <p className="text-xs text-text-secondary">دنبال‌کننده</p>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="font-bold text-text-primary">{user.followingCount}</p>
                                <p className="text-xs text-text-secondary">دنبال‌شونده</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* اطلاعات کاربر */}
                <dl className="divide-y divide-border">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 py-4 first:pt-0 last:pb-0">
                        <dt className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-1">
                            <User className="w-4 h-4" />
                            نام کاربری
                        </dt>
                        <dd className="text-sm sm:col-span-3 font-medium text-text-primary">
                            {user.username}@
                        </dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 py-4 first:pt-0 last:pb-0">
                        <dt className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-1">
                            <FileText className="w-4 h-4" />
                            بیوگرافی
                        </dt>
                        <dd className="text-sm sm:col-span-3 font-medium text-text-primary">
                            {user.bio || 'هنوز بیوگرافی وارد نشده است'}
                        </dd>
                    </div>
                </dl>
            </div>

            {/* ✅ لیست پست‌های کاربر */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                <h2 className="text-lg font-bold text-text-primary mb-4">پست‌ها</h2>
                <ProfilePostsList userId={user.id} />
            </div>
        </div>
    );
}