'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera } from './svg/Camera';
interface AvatarUploadProps {
    previewAvatar: string | null;
    isUploading: boolean;
    fullName?: string;
    onFileChange: (file: File) => void;
    onRemove: () => void;
}

export const AvatarUpload = ({
    previewAvatar,
    isUploading,
    fullName,
    onFileChange,
    onRemove,
}: AvatarUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileChange(file);
        }
    };

    return (
        <div>
            <label
                className="
                block
                text-sm
                font-medium
                text-primary
                mb-3
                ">
                عکس پروفایل
            </label>
            <div
                className="
                flex
                items-center
                gap-5
                ">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="
                    relative
                    w-20
                    h-20
                    rounded-full
                    overflow-hidden
                    bg-gradient-primary
                    flex
                    items-center
                    justify-center
                    shadow-glow-primary
                    flex-shrink-0
                    group
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary/40
                    focus-visible:ring-offset-2
                    ">
                    {previewAvatar ? (
                        <Image
                            src={previewAvatar}
                            alt="آواتار"
                            width={100}
                            height={100}
                            unoptimized
                            className="
                            w-full
                            h-full
                            object-cover
                            "/>
                    ) : (
                        <span
                            className="
                            text-2xl
                            font-bold
                            text-white
                            ">
                            {fullName?.[0] || '👤'}
                        </span>
                    )}

                    <span
                        className="
                        absolute
                        inset-0
                        bg-black/0
                        group-hover:bg-black/40
                        transition-colors
                        flex
                        items-center
                        justify-center
                        ">
                       <Camera />
                    </span>

                    {isUploading && (
                        <span
                            className="
                            absolute
                            inset-0
                            bg-black/50
                            flex
                            items-center
                            justify-center
                            ">
                            <span
                                className="
                                w-6
                                h-6
                                border-4
                                border-white
                                border-t-transparent
                                rounded-full
                                animate-spin"
                            />
                        </span>
                    )}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="
                        btn-secondary
                        text-sm
                        px-4
                        py-2
                        disabled:opacity-50
                        ">
                        {isUploading ? 'در حال آپلود...' : 'تغییر عکس'}
                    </button>
                    {previewAvatar && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="
                            text-sm
                            text-red-500
                            hover:text-red-700
                            mt-2
                            mr-3
                            block">
                            حذف عکس
                        </button>
                    )}
                    <p
                        className="
                        text-xs
                        text-secondary
                        mt-2
                        ">
                        JPG، PNG، GIF یا WEBP — حداکثر ۵ مگابایت
                    </p>
                </div>
            </div>
        </div>
    );
};