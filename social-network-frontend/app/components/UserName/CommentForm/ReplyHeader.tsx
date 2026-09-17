'use client';

import { X } from 'lucide-react';

interface ReplyHeaderProps {
    onCancel: () => void;
}

export const ReplyHeader = ({ onCancel }: ReplyHeaderProps) => {
    return (
        <div
            className="
            flex
            items-center
            justify-between
            mb-1
            px-2
            py-1
            bg-border/50
            rounded-t-lg
            text-xs
            text-secondary
        ">
            <span>در حال پاسخ به کامنت...</span>
            <button
                type="button"
                onClick={onCancel}
                className="
                hover:text-primary
                transition-colors"
                aria-label="لغو پاسخ"
            >
                <X size={14} />
            </button>
        </div>
    );
};