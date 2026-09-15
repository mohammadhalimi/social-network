// components/profile/posts/PostContentBlocks.tsx
'use client';

import Image from 'next/image';

interface PostContentBlocksProps {
    contentBlocks: any[];
}

export const PostContentBlocks = ({ contentBlocks }: PostContentBlocksProps) => {
    return (
        <div className="mb-4">
            {contentBlocks.map((block: any, index: number) => {
                switch (block.type) {
                    case 'header':
                        return (
                            <h1
                                key={index}
                                className="
                                text-2xl
                                font-bold
                                text-primary
                                mb-3
                            ">
                                {block.content}
                            </h1>
                        );
                    case 'image':
                        if (!block.url) return null;
                        return (
                            <div
                                key={index}
                                className="
                                my-3
                                rounded-xl
                                overflow-hidden
                            ">
                                <Image
                                    src={block.url}
                                    alt={block.caption || 'تصویر'}
                                    className="
                                    w-full
                                    h-auto
                                    object-cover"
                                    width={800}
                                    height={500}
                                    unoptimized
                                />
                                {block.caption && (
                                    <p
                                        className="
                                        text-xs
                                        text-secondary
                                        mt-1
                                    ">
                                        {block.caption}
                                    </p>
                                )}
                            </div>
                        );
                    case 'video':
                        if (!block.url) return null;
                        return (
                            <div
                                key={index}
                                className="
                                my-3
                                rounded-xl
                                overflow-hidden
                                flex
                                justify-center
                                bg-black
                                ">
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
                        );
                    default:
                        return (
                            <p
                                key={index}
                                className="
                                text-primary
                                leading-relaxed
                                mb-2
                                whitespace-pre-wrap
                            ">
                                {block.content}
                            </p>
                        );
                }
            })}
        </div>
    );
};