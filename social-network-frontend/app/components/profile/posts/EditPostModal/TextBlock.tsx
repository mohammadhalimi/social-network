'use client';

import { RemoveBlockButton } from './RemoveBlockButton';

interface TextBlockProps {
    content: string;
    onChange: (value: string) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export const TextBlock = ({ content, onChange, onRemove, canRemove }: TextBlockProps) => (
    <div
    className="
    relative
    mb-3
    group
    ">
        <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="متن پست را بنویسید..."
            className="
            w-full
            bg-transparent
            border
            border-border
            rounded-xl
            focus:border-primary
            outline-none
            p-3
            text-primary
            placeholder:text-secondary
            min-h-[80px]
            "/>
        <RemoveBlockButton onClick={onRemove} visible={canRemove} positionClass="-top-2 -right-3" />
    </div>
);