// app/hooks/useLogout.ts
'use client';

import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/app/redux/hooks';
import { useMutation } from '@apollo/client/react';
import { LOGOUT } from '@/app/graphql/auth.queries';
import { logout } from '@/app/redux/features/authSlice';

export const useLogout = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [logoutMutation] = useMutation(LOGOUT);

    const handleLogout = async () => {
        try {
            const { data } = await logoutMutation();
            if (data?.logout?.success) {
                dispatch(logout());
                toast.success('✅ با موفقیت خارج شدید!');
                router.push('/auth/login');
            } else {
                toast.error('❌ خطا در خروج از حساب');
            }
        } catch (error) {
            toast.error('❌ خطا در خروج از حساب');
        }
    };

    return { handleLogout };
};