'use client';

import type { ContentBlock } from './type';

interface BlockTypeButtonsProps {
    onAdd: (type: ContentBlock['type']) => void;
}

const BUTTONS: { type: ContentBlock['type']; label: string }[] = [
    { type: 'header', label: 'عنوان' },
    { type: 'text', label: 'متن' },
    { type: 'image', label: 'تصویر' },
    { type: 'video', label: 'ویدیو' },
];

export const BlockTypeButtons = ({ onAdd }: BlockTypeButtonsProps) => (
    <div className="flex flex-wrap gap-2 mb-4">
        {BUTTONS.map(({ type, label }) => (
            <button
                key={type}
                onClick={() => onAdd(type)}
                className="
                px-3
                py-1.5
                bg-primary/10
                text-primary
                rounded-lg
                text-sm
                cursor-pointer
                hover:bg-primary/20
                transition-colors">
                {label}
            </button>
        ))}
    </div>
);