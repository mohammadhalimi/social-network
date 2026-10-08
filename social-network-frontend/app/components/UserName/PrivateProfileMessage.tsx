'use client';

import { Lock, Clock } from 'lucide-react';

interface PrivateProfileMessageProps {
    isPrivate: boolean;
    isFollowing: boolean;
    isFollowRequestPending: boolean;
    isOwner: boolean;
}

export const PrivateProfileMessage = ({
    isPrivate,
    isFollowing,
    isFollowRequestPending,
    isOwner,
}: PrivateProfileMessageProps) => {
    // ✅ اگر صاحب پیج باشه، یا پیج عمومی باشه، یا کاربر فالوور باشه → هیچی نشون نده
    if (isOwner || !isPrivate || isFollowing) {
        return null;
    }

    // ✅ حالت ۱: درخواست در حال انتظار
    if (isFollowRequestPending) {
        return (
            <div className="bg-card border border-border rounded-2xl p-12 shadow-soft text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-primary mb-2">
                    درخواست شما در انتظار تأیید است
                </h2>
                <p className="text-sm text-secondary max-w-md mx-auto leading-relaxed">
                    درخواست دنبال کردن شما برای این حساب ارسال شده است.
                    پس از تأیید صاحب حساب، می‌توانید پست‌ها و استوری‌های او را ببینید.
                </p>
            </div>
        );
    }

    // ✅ حالت ۲: پیج خصوصی، درخواستی نفرستاده
    return (
        <div className="bg-card border border-border rounded-2xl p-12 shadow-soft text-center">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">
                این حساب خصوصی است
            </h2>
            <p className="text-sm text-secondary max-w-md mx-auto leading-relaxed">
                برای دیدن پست‌ها و استوری‌های این حساب، ابتدا باید درخواست
                دنبال کردن بفرستید و منتظر تأیید بمانید.
            </p>
        </div>
    );
};