'use client';

import { X } from 'lucide-react';
import { BlockProps, isContentBlock } from '../types';

interface HeaderBlockProps extends BlockProps {
    showRemoveButton: boolean;
}

export const HeaderBlock = ({
    block,
    index,
    showRemoveButton,
    onUpdate,
    onRemove,
}: HeaderBlockProps) => {
    if (!isContentBlock(block)) return null;

    return (
        <div
            className="
            relative
            mb-4
            group
        ">
            <div
                className="
                relative
            ">
                <input
                    type="text"
                    value={block.content}
                    onChange={(e) => onUpdate(index, 'content', e.target.value)}
                    placeholder="عنوان پست را وارد کنید..."
                    className="
                    w-full
                    text-2xl
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
                    transition-colors
                    " />
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