// components/profile/posts/blocks/VideoBlock.tsx
'use client';
import {
    BlockProps,
    isMediaBlock
} from '../types';
import {
    X,
    Loader2,
    Video as VideoIcon
} from 'lucide-react';

interface VideoBlockProps extends BlockProps {
    isUploading?: boolean;
    showRemoveButton: boolean;
    onUpload: (index: number, file: File, type: 'image' | 'video') => void;
}

export const VideoBlock = ({
    block,
    index,
    isUploading,
    showRemoveButton,
    onUpdate,
    onRemove,
    onUpload,
}: VideoBlockProps) => {
    if (!isMediaBlock(block) || block.type !== 'video') return null;

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
                    <div className="relative">
                        <div
                            className='
                            my-3
                            rounded-xl
                            overflow-hidden
                            flex
                            justify-center
                            bg-black
                        '>
                            <video
                                src={block.url}
                                controls
                                className="
                                max-h-[500px]
                                w-auto
                                max-w-full
                                object-contain
                            "/>
                        </div>
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
                                <VideoIcon
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
                                    (MP4, WebM - حداکثر ۵۰ مگابایت)
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUpload(index, file, 'video');
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