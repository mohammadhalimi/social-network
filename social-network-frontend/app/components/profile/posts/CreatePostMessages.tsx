'use client';

import { CheckCircle } from 'lucide-react';

interface CreatePostMessagesProps {
    showSuccess: boolean;
    errorMessage: string | null;
}

export const CreatePostMessages = ({ showSuccess }: CreatePostMessagesProps) => {
    if (showSuccess) {
        return (
            <div
                className="
                mb-4
                bg-green-50
                border
                border-green-800
                rounded-xl
                p-4
                flex
                items-center
                gap-3
                animate-in
                slide-in-from-top-2
            ">
                <CheckCircle
                    className="
                    w-5
                    h-5
                    text-green-500
                    flex-shrink-0
                "/>
                <p
                    className="
                    text-green-700
                    text-sm
                    font-medium
                ">
                    پست شما با موفقیت منتشر شد! ✅
                </p>
            </div>
        );
    }

    return null;
};