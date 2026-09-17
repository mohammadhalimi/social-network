// app/user/[username]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { getAvatarUrl } from '../lib/utils/avatar';
import { GET_USER_BY_USERNAME } from '@/app/graphql/user.queries';
import { ProfileLoading } from '../components/UserName/ProfileLoading';
import { ProfileNotFound } from '../components/UserName/ProfileNotFound';
import { UserProfileContent } from '../components/UserName/UserProfileContent';


export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;

    const { data, loading, error } = useQuery(GET_USER_BY_USERNAME, {
        variables: { username },
        skip: !username,
    });

    // حالت لودینگ
    if (loading) return <ProfileLoading />;

    // حالت خطا یا کاربر یافت نشد
    if (error || !data?.getUserByUsername) return <ProfileNotFound />;

    const user = data.getUserByUsername;

    // ✅ محاسبه URL آواتار (به یک هوک یا فایل کمکی منتقل شود)

    const avatarUrl = getAvatarUrl(user.avatar);

    return (
        <div
            className="
            max-w-4xl
            mx-auto
            px-4
            py-8
        ">
            <UserProfileContent user={user} avatarUrl={avatarUrl} />
        </div>
    );
}