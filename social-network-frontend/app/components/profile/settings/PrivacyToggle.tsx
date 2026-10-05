'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { Lock, Globe, Loader2 } from 'lucide-react';
import { UPDATE_PRIVACY } from '@/app/graphql/notification.queries';
import { ME_QUERY } from '@/app/graphql/user.queries'; // ⚠️ مطمئن شوید ME_QUERY را قبلاً اضافه کرده‌اید

export const PrivacyToggle = () => {
    const [isUpdating, setIsUpdating] = useState(false);

    // ✅ دریافت وضعیت فعلی از me
    const { data, loading } = useQuery(ME_QUERY, {
        fetchPolicy: 'cache-first',
    });

    const isPrivate = data?.me?.isPrivate ?? false;

    // ✅ Mutation برای تغییر
    const [updatePrivacy] = useMutation(UPDATE_PRIVACY, {
        errorPolicy: 'all',
        refetchQueries: [ME_QUERY],
    });

    const handleToggle = async () => {
        if (isUpdating) return;

        setIsUpdating(true);
        try {
            const { data, error } = await updatePrivacy({
                variables: { isPrivate: !isPrivate },
            });

            if (error) {
                toast.error(error.message || 'خطا در تغییر وضعیت');
                return;
            }

            if (data?.updatePrivacy.success) {
                toast.success(data.updatePrivacy.message);
            } else {
                toast.error(data?.updatePrivacy.message || 'خطا در تغییر وضعیت');
            }
        } catch (err: any) {
            toast.error(err.message || 'خطای شبکه');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-background/50 dark:bg-gray-800/50 rounded-xl p-5 border border-border/50">
                <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div
            className="
            bg-background/50
            dark:bg-gray-800/50
            rounded-xl
            p-5
            border
            border-border/50
            ">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isPrivate ? (
                        <Lock className="w-5 h-5 text-primary" />
                    ) : (
                        <Globe className="w-5 h-5 text-primary" />
                    )}
                    <div>
                        <p className="font-medium text-primary">حریم خصوصی</p>
                        <p className="text-sm text-secondary">
                            {isPrivate ? 'حساب خصوصی' : 'حساب عمومی'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className="
                    relative
                    w-14
                    h-8
                    rounded-full
                    bg-gray-200
                    dark:bg-gray-700
                    transition-colors
                    duration-300
                    flex-shrink-0
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary/40
                    hover:cursor-pointer
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    "
                    aria-label="تغییر وضعیت حریم خصوصی"
                >
                    <span
                        className={`
                        absolute
                        top-1
                        left-1
                        w-6
                        h-6
                        rounded-full
                        bg-white
                        shadow-md
                        transition-all
                        duration-300
                        ${isPrivate ? 'translate-x-6' : 'translate-x-0'}
                        `}
                    />
                </button>
            </div>

            <p className="text-xs text-secondary mt-3 leading-relaxed">
                {isPrivate
                    ? 'فقط دنبال‌کنندگان تأییدشده می‌توانند پست‌ها و استوری‌های شما را ببینند.'
                    : 'همه می‌توانند پست‌ها و استوری‌های شما را ببینند.'}
            </p>
        </div>
    );
};