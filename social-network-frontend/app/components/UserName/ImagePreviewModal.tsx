'use client';

import Image from 'next/image';
import { X } from 'lucide-react';


interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    altText?: string;
}

export const ImagePreviewModal = (
    {
        isOpen,
        onClose,
        imageUrl,
        altText = 'تصویر' }: ImagePreviewModalProps) => {
            
    if (!isOpen) return null;

    return (
        <div
            className="
            fixed
            inset-0
            bg-black/80
            flex
            items-center
            justify-center
            z-[100]
            p-4
            backdrop-blur-sm
        "
            onClick={onClose} // بستن با کلیک روی پس‌زمینه
        >
            <div
                className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // جلوگیری از بستن با کلیک روی عکس
            >
                {/* دکمه بستن */}
                <button
                    onClick={onClose}
                    className="
                    absolute
                    top-4
                    right-4
                    p-2
                    bg-black/50
                    hover:bg-black/70
                    text-white
                    rounded-full
                    transition-colors
                    z-10
                    hover:cursor-pointer
                "
                    aria-label="بستن"
                >
                    <X size={24} />
                </button>

                {/* تصویر بزرگ */}
                <div
                    className="
                    relative
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                ">
                    <Image
                        src={imageUrl}
                        alt={altText}
                        className="
                        max-w-full
                        max-h-full
                        object-contain
                        rounded-lg
                        shadow-2xl
                    "
                        width={1200}
                        height={1200}
                        unoptimized
                    />
                </div>
            </div>
        </div>
    );
};