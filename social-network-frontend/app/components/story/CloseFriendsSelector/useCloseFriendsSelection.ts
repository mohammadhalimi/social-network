// components/story/CloseFriendsSelector/useCloseFriendsSelection.ts
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import {
    GET_CLOSE_FRIENDS,
    ADD_CLOSE_FRIEND,
    REMOVE_CLOSE_FRIEND,
    StoryUser,
} from '@/app/graphql/story.queries';

export const useCloseFriendsSelection = (onChange?: (count: number) => void) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    const { data: closeFriendsData, refetch: refetchClose } = useQuery(GET_CLOSE_FRIENDS, {
        fetchPolicy: 'cache-and-network',
    });

    const [addCloseFriend] = useMutation(ADD_CLOSE_FRIEND, { errorPolicy: 'all' });
    const [removeCloseFriend] = useMutation(REMOVE_CLOSE_FRIEND, { errorPolicy: 'all' });

    const closeFriends: StoryUser[] = closeFriendsData?.getCloseFriends || [];

    // ✅ پر کردن selectedIds با Close Friends فعلی
    useEffect(() => {
        if (closeFriends.length > 0) {
            setSelectedIds(new Set(closeFriends.map(cf => cf.id)));
        }
    }, [closeFriends]);

    // ✅ گزارش تعداد به والد
    useEffect(() => {
        onChange?.(selectedIds.size);
    }, [selectedIds, onChange]);

    const toggle = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const save = async () => {
        setIsSaving(true);
        try {
            const currentIds = new Set(closeFriends.map(cf => cf.id));
            const toAdd = [...selectedIds].filter(id => !currentIds.has(id));
            const toRemove = [...currentIds].filter(id => !selectedIds.has(id));

            await Promise.all(toRemove.map(id => removeCloseFriend({ variables: { userId: id } })));
            await Promise.all(toAdd.map(id => addCloseFriend({ variables: { userId: id } })));

            await refetchClose();
            toast.success('لیست دوستان نزدیک ذخیره شد ✅');
        } catch (err: any) {
            toast.error(err.message || 'خطا در ذخیره‌سازی');
        } finally {
            setIsSaving(false);
        }
    };

    return { selectedIds, toggle, save, isSaving };
};