// components/profile/posts/blocks/TextBlock.tsx
'use client';

import { X } from 'lucide-react';
import {
    BlockProps,
    isContentBlock
} from '../types';

interface TextBlockProps extends BlockProps {
    showRemoveButton: boolean;
}

export const TextBlock = ({
    block,
    index,
    showRemoveButton,
    onUpdate,
    onRemove,
}: TextBlockProps) => {
    if (!isContentBlock(block)) return null;

    return (
        <div
            className="
            relative
            mb-4
            group
        ">
            <div className="relative">
                <textarea
                    value={block.content}
                    onChange={(e) => onUpdate(index, 'content', e.target.value)}
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
                    min-h-[120px]
                    transition-colors
                    "/>
                {showRemoveButton && (
                    <button
                        onClick={() => onRemove(index)}
                        className="
                        absolute
                        -top-2
                        -right-2
                        p-1
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        rounded-full
                        shadow-lg
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                        hover:cursor-pointer
                        ">
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};