'use client';

import { Loader2 } from 'lucide-react';

interface CreatePostActionsProps {
    blocksCount: number;
    contentCount: number;
    isSubmitting: boolean;
    onSubmit: () => void;
    onCancel: () => void;
}

export const CreatePostActions = ({
    blocksCount,
    contentCount,
    isSubmitting,
    onSubmit,
    onCancel,
}: CreatePostActionsProps) => {
    return (
        <div
            className="
            flex
            justify-between
            items-center
            mt-6
            pt-4
            border-t
            border-border
        ">
            <div
                className="
                text-xs
                text-secondary
            ">
                {blocksCount} بلوک · {contentCount} محتوا
            </div>
            <div
                className="
                flex
                gap-3
            ">
                <button
                    onClick={onCancel}
                    className="
                    px-6
                    py-2
                    text-secondary
                    hover:text-primary
                    transition-colors
                    hover:cursor-pointer
                    ">
                    انصراف
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="
                    px-6
                    py-2
                    bg-primary
                    text-white
                    rounded-lg
                    hover:bg-secondary
                    transition-colors
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    flex
                    items-center gap-2
                    hover:cursor-pointer
                    ">
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    {isSubmitting ? 'در حال ارسال...' : 'انتشار پست'}
                </button>
            </div>
        </div>
    );
};