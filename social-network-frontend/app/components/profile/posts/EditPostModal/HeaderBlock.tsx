'use client';

import { RemoveBlockButton } from './RemoveBlockButton';

interface HeaderBlockProps {
    content: string;
    onChange: (value: string) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export const HeaderBlock = ({ content, onChange, onRemove, canRemove }: HeaderBlockProps) => (
    <div className="relative mb-3 group">
        <input
            type="text"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="عنوان پست را وارد کنید..."
            className="
            w-full
            text-xl
            font-bold
            bg-transparent
            border-b-2
            border-transparent
            hover:border-border
            focus:border-primary
            outline-none
            py-2
            text-primary
            placeholder:text-secondary
            pr-10"/>
        <RemoveBlockButton onClick={onRemove} visible={canRemove} positionClass="-top-3.5 -right-3.5" />
    </div>
);