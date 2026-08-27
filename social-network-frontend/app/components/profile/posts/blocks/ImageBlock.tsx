'use client';

import Image from 'next/image';
import {
    BlockProps,
    isMediaBlock
} from '../types';
import {
    X,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';

interface ImageBlockProps extends BlockProps {
    isUploading?: boolean;
    showRemoveButton: boolean;
    onUpload: (index: number, file: File, type: 'image' | 'video') => void;
}

export const ImageBlock = ({
    block,
    index,
    isUploading,
    showRemoveButton,
    onUpdate,
    onRemove,
    onUpload,
}: ImageBlockProps) => {
    if (!isMediaBlock(block) || block.type !== 'image') return null;

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
                border-2
                border-dashed
                border-border
                rounded-xl
                p-4
                hover:border-primary/50
                transition-colors
            ">
                {block.url ? (
                    <div
                        className="
                        relative
                    ">
                        <Image
                            src={block.url}
                            alt="تصویر پست"
                            className="
                            w-full
                            h-auto
                            rounded-lg
                            max-h-lg
                            object-contain"
                            width={100}
                            height={100}
                            unoptimized
                        />
                        <input
                            type="text"
                            value={block.caption || ''}
                            onChange={(e) => onUpdate(index, 'caption', e.target.value)}
                            placeholder="توضیح تصویر (اختیاری)"
                            className="
                            w-full
                            mt-2
                            bg-transparent
                            border
                            border-border
                            rounded-lg
                            p-2
                            text-sm
                            text-primary
                            placeholder:text-secondary
                            focus:border-primary
                            outline-none
                            transition-colors
                            "/>
                        <button
                            onClick={() => onUpdate(index, 'url', '')}
                            className="
                            absolute
                            top-2
                            right-2
                            p-1
                            bg-black/50
                            hover:bg-black/70
                            text-white
                            rounded-full
                            transition-colors
                            ">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label
                        className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        cursor-pointer
                        py-8
                    ">
                        {isUploading ? (
                            <Loader2
                                size={40}
                                className="
                                text-primary
                                animate-spin
                                mb-2
                            "/>
                        ) : (
                            <>
                                <ImageIcon
                                    size={40}
                                    className="
                                    text-secondary
                                    mb-2
                                "/>
                                <span
                                    className="
                                    text-secondary
                                    text-sm
                                ">
                                    کلیک کنید یا فایل را بکشید
                                </span>
                                <span
                                    className="
                                    text-secondary
                                    text-xs
                                    mt-1
                                ">
                                    (JPG, PNG, WebP - حداکثر 5MB)
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUpload(index, file, 'image');
                            }}
                        />
                    </label>
                )}
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