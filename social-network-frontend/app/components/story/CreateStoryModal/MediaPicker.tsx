// components/story/CreateStoryModal/MediaPicker.tsx
'use client';

import { X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface MediaPickerProps {
    previewUrl: string | null;
    mediaType: 'image' | 'video';
    onSelect: (file: File) => void;
    onClear: () => void;
}

export const MediaPicker = ({ previewUrl, mediaType, onSelect, onClear }: MediaPickerProps) => (
    <div
        className="
        border-2
        border-dashed
        border-border
        rounded-xl
        p-4
        mb-4
    ">
        {previewUrl ? (
            <div
                className="relative">
                {mediaType === 'image' ? (
                    <img
                        src={previewUrl}
                        alt="پیش‌نمایش"
                        className="
                        w-full
                        max-h-[300px]
                        object-contain
                        rounded-lg"
                    />
                ) : (
                    <video
                        src={previewUrl}
                        controls
                        className="
                        w-full
                        max-h-[300px]
                        rounded-lg
                        "/>
                )}
                <button
                    onClick={onClear}
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
                    <X size={14} />
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
                <div
                    className="
                    flex
                    gap-3
                    mb-2
                ">
                    <ImageIcon
                        size={28}
                        className="
                        text-secondary
                    "/>
                    <VideoIcon
                        size={28}
                        className="
                        text-secondary
                    "/>
                </div>
                <span
                    className="
                    text-secondary
                    text-sm
                ">
                    کلیک کنید تا عکس یا ویدیو انتخاب شود
                </span>
                <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) onSelect(selected);
                    }}
                />
            </label>
        )}
    </div>
);