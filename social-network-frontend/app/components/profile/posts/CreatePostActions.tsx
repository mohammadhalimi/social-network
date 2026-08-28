'use client';

import { useState } from 'react';
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
    const [showConfirm, setShowConfirm] = useState(false);

    const handleCancel = () => {
        if (contentCount > 0) {
            setShowConfirm(true);
        } else {
            onCancel();
        }
    };

    const handleConfirmReset = () => {
        setShowConfirm(false);
        onCancel();
    };

    return (
        <div
            className="
            flex
            flex-col
            gap-3
            mt-6
            pt-4
            border-t
            border-border
        ">
            <div
                className="
                flex
                justify-between
                items-center
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
                    flex gap-3
                ">
                    <button
                        onClick={handleCancel}
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
            {showConfirm && (
                <div
                    className="
                    fixed
                    inset-0
                    bg-black/50
                    flex
                    items-center
                    justify-center
                    z-50
                    p-4
                ">
                    <div
                        className="
                        bg-card
                        rounded-2xl
                        p-6
                        max-w-md
                        w-full
                        shadow-xl
                    ">
                        <h1
                            className="
                            text-lg
                            font-bold
                            text-primary
                            mb-2
                            hover:cursor-pointer
                        ">
                            آیا مطمئن هستید؟
                        </h1>
                        <p
                            className="
                            text-secondary
                            text-sm
                            mb-6
                        ">
                            با انصراف، تمام محتوای نوشته شده از بین خواهد رفت.
                        </p>
                        <div
                            className="
                            flex
                            gap-3
                            justify-end
                        ">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="
                                px-4
                                py-2
                                text-secondary
                                hover:text-primary
                                transition-colors
                                hover:cursor-pointer
                                ">
                                ادامه ویرایش
                            </button>
                            <button
                                onClick={handleConfirmReset}
                                className="
                                px-4
                                py-2
                                bg-red-500
                                text-white
                                rounded-lg
                                hover:bg-red-600
                                transition-colors
                                hover:cursor-pointer
                                ">
                                انصراف از پست
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};