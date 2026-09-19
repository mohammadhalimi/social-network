'use client';

import Image from 'next/image';

interface PostPreviewMediaProps {
    previewImage: string | null;
    previewVideo: string | null;
}

export const PostPreviewMedia = ({ previewImage, previewVideo }: PostPreviewMediaProps) => {
    const showImage = !!previewImage;
    const showVideo = !previewImage && !!previewVideo;

    if (showImage) {
        return (
            <div
                className="
                relative
                w-full
                h-48
                bg-border
            ">
                <Image
                    src={previewImage!}
                    alt="پیش‌نمایش"
                    className="
                    w-full
                    h-full
                    object-cover"
                    width={400}
                    height={200}
                    unoptimized
                />
            </div>
        );
    }

    if (showVideo) {
        return (
            <div
                className="
                relative
                w-full
                h-48
                bg-border
                overflow-hidden
            ">
                <video
                    src={previewVideo!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="
                    w-full
                    h-full
                    object-cover
                    "/>
            </div>
        );
    }

    return null;
};