'use client';

import { RemoveBlockButton } from './RemoveBlockButton';
import Image from 'next/image';
import {
    Loader2,
    Image as ImageIcon,
    Upload,
    X
} from 'lucide-react';


interface ImageBlockProps {
    url: string;
    caption?: string;
    isUploading: boolean;
    onCaptionChange: (value: string) => void;
    onFileSelect: (file: File) => void;
    onClearUrl: () => void;
    onRemoveBlock: () => void;
    canRemove: boolean;
}

export const ImageBlock = ({
    url,
    caption,
    isUploading,
    onCaptionChange,
    onFileSelect,
    onClearUrl,
    onRemoveBlock,
    canRemove,
}: ImageBlockProps) => {
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    return (
        <div
            className="
        relative
        mb-3
        group
        ">
            <div
                className="
            border-2
            border-dashed
            border-border
            rounded-xl
            p-4
            hover:border-primary/50
            transition-colors
            ">
                {url ? (
                    <div
                        className="
                    relative
                    ">
                        <Image
                            src={url}
                            alt="تصویر"
                            className="
                            w-full
                            h-auto
                            rounded-lg
                            max-h-xs
                            object-contain"
                            width={100}
                            height={100}
                            unoptimized
                        />
                        <input
                            type="text"
                            value={caption || ''}
                            onChange={(e) => onCaptionChange(e.target.value)}
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
                            "/>
                        <div
                            className="
                        absolute
                        top-2
                        right-2
                        flex
                        gap-1
                        ">
                            <label
                                className="
                            p-1
                            bg-black/50
                            hover:bg-black/70
                            text-white
                            rounded-full
                            cursor-pointer
                            transition-colors
                            ">
                                <Upload size={14} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                            </label>
                            <button
                                onClick={onClearUrl}
                                className="
                                p-1
                                bg-black/50
                                hover:bg-black/70
                                text-white
                                rounded-full
                                transition-colors
                                ">
                                <X size={14} />
                            </button>
                        </div>
                        {isUploading && (
                            <div
                                className="
                            absolute
                            inset-0
                            bg-black/50
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            ">
                                <Loader2
                                    size={32}
                                    className="
                                text-white
                                animate-spin
                                "/>
                            </div>
                        )}
                    </div>
                ) : (
                    <label
                        className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    cursor-pointer
                    py-6
                    ">
                        {isUploading ? (
                            <Loader2
                                size={32}
                                className="
                            text-primary
                            animate-spin
                            mb-2
                            "/>
                        ) : (
                            <>
                                <ImageIcon
                                    size={32}
                                    className="
                                text-secondary
                                mb-2
                                "/>
                                <span
                                    className="
                                text-secondary
                                text-sm
                                ">کلیک کنید تا تصویر آپلود شود
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
                            onChange={handleFileInput}
                        />
                    </label>
                )}
            </div>
            <RemoveBlockButton
                onClick={onRemoveBlock}
                visible={canRemove}
            />
        </div>
    );
};