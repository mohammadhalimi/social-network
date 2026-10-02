// components/story/StoryViewerModal/StoryMedia.tsx
'use client';

import { RefObject } from 'react';
import Image from 'next/image';

interface StoryMediaProps {
    mediaUrl: string;
    isVideo: boolean;
    videoRef: RefObject<HTMLVideoElement | null>;
}

export const StoryMedia = ({ mediaUrl, isVideo, videoRef }: StoryMediaProps) => (
    <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden rounded-xl mt-16">
        {isVideo ? (
            <video
                ref={videoRef}
                src={mediaUrl}
                autoPlay
                playsInline
                className="max-w-full max-h-full object-contain"
            />
        ) : (
            <Image
                src={mediaUrl}
                alt="استوری"
                className="max-w-full max-h-full object-contain"
                width={800}
                height={1200}
                unoptimized
            />
        )}
    </div>
);