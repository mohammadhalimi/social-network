'use client';

import { useQuery } from '@apollo/client/react';
import {
    Loader2,
    Bookmark
} from 'lucide-react';
import { GET_SAVED_POSTS } from '@/app/graphql/post.queries';
import { ProfilePostCard } from '../UserName/ProfilePostCard'; // ✅ استفاده از کارت پست پروفایل

export const SavedPostsList = () => {
    const { data, loading, error } = useQuery(GET_SAVED_POSTS, {
        variables: { limit: 20, offset: 0 },
        fetchPolicy: 'cache-and-network',
    });

    if (loading) {
        return (
            <div
                className="
                flex
                justify-center
                py-12
            ">
                <Loader2
                    className="
                    w-8
                    h-8
                    animate-spin
                    text-primary
                "/>
            </div>
        );
    }

    if (error) {
        return <div
            className="
            text-center
            py-8
            text-red-500
        ">
            خطا در دریافت پست‌های ذخیره‌شده
        </div>;
    }
    const rawPosts = data?.getSavedPosts?.posts || [];
    const posts = rawPosts.filter((post) => post.isSaved);

    if (posts.length === 0) {
        return (
            <div
                className="
                text-center
                py-12 bg-card
                rounded-2xl
                border
                border-border
            ">
                <Bookmark
                    size={48}
                    className="
                    mx-auto
                    text-secondary
                    mb-4
                    opacity-50
                "/>
                <h1
                    className="
                    text-lg
                    font-bold
                    text-primary
                    mb-2
                ">
                    هنوز پستی ذخیره نکرده‌اید
                </h1>
                <p
                    className="
                    text-sm
                    text-secondary
                    max-w-sm
                    mx-auto
                ">
                    با کلیک روی آیکون بوکمارک در پست‌ها، آن‌ها را برای دیدن بعدی در اینجا ذخیره کنید.
                </p>
            </div>
        );
    }

    return (
        <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-4
        ">
            {posts.map((post) => (
                <ProfilePostCard key={post.id} post={post} />
            ))}
        </div>
    );
};