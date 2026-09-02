// components/common/ConfirmModal.tsx
'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText = 'حذف',
    cancelText = 'انصراف',
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-[60]
            p-4
        ">
            <div
                className="
                bg-card
                rounded-2xl
                p-6
                max-w-sm
                w-full
                shadow-xl
            ">
                <div
                    className="
                    flex
                    items-center
                    gap-3
                    mb-3
                ">
                    <div
                        className="
                        p-2
                        bg-red-500/10
                        rounded-full
                    ">
                        <AlertTriangle
                            size={22}
                            className="text-red-500"
                        />
                    </div>
                    <h1
                        className="
                        text-lg
                        font-bold
                        text-primary
                    ">
                        {title}
                    </h1>
                </div>

                <p
                    className="
                    text-secondary
                    text-sm
                    mb-6
                ">
                    {message}
                </p>

                <div
                    className="
                    flex
                    justify-end
                    gap-3
                ">
                    <button
                        onClick={onCancel}
                        className="
                        px-4
                        py-2
                        text-secondary
                        hover:text-primary
                        transition-colors
                        hover:cursor-pointer
                        ">
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
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
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};