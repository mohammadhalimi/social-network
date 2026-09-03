'use client';

import { X } from 'lucide-react';

interface RemoveBlockButtonProps {
    onClick: () => void;
    visible: boolean;
    positionClass?: string;
}

export const RemoveBlockButton = ({ onClick, visible, positionClass = 'top-1 right-1' }: RemoveBlockButtonProps) => {
    if (!visible) return null;

    return (
        <button
            onClick={onClick}
            className={`
            z-10
            p-1.5
            absolute
            text-red-500
            rounded-full
            bg-red-500/10
            transition-all
            ${positionClass}
            hover:text-red-700
            hover:bg-red-500/20
            hover:cursor-pointer
            `}
        >
            <X size={18} />
        </button>
    );
};