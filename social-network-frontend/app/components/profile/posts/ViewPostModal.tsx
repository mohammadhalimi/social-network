'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { formatPersianDate } from '@/app/lib/formatDate';

interface ViewPostModalProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
}

export const ViewPostModal = ({ post, isOpen, onClose }: ViewPostModalProps) => {
    if (!isOpen) return null;

    // ✅ فرمت تاریخ با بررسی validity
    const formattedDate = formatPersianDate(post.createdAt);

    // پارس کردن محتوای JSON
    let contentBlocks = [];
    try {
        const parsed = JSON.parse(post.content);
        contentBlocks = parsed.blocks || [];
    } catch {
        contentBlocks = [{ type: 'text', content: post.content }];
    }

    return (
        <div
            className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
            p-4
        ">
            <div
                className="
                bg-card
                rounded-2xl
                p-6
                max-w-3xl
                w-full
                max-h-[90vh]
                overflow-y-auto
                shadow-xl
            ">
                <div
                    className="
                    flex
                    items-center
                    justify-between
                    mb-4
                ">
                    <h1
                        className="
                        text-xl
                        font-bold
                        text-primary
                    ">مشاهده پست
                    </h1>
                    <button
                        onClick={onClose}
                        className="
                        p-1
                        hover:bg-border
                        rounded-lg
                        transition-colors
                        ">
                        <X size={24} />
                    </button>
                </div>
                <div
                    className="
                    flex
                    items-center
                    gap-3
                    mb-4
                ">
                    <div
                        className="
                        w-10
                        h-10
                        rounded-full
                        bg-gradient-primary
                        flex
                        items-center
                        justify-center
                        overflow-hidden
                        flex-shrink-0
                    ">
                        {post.user?.avatar ? (
                            <Image
                                src={post.user.avatar}
                                alt={post.user.fullName || 'کاربر'}
                                className="
                                w-full
                                h-full
                                object-cover"
                                width={100}
                                height={100}
                                unoptimized
                            />
                        ) : (
                            <span
                                className="
                                text-white
                                font-bold
                                text-sm
                            ">
                                {post.user?.fullName?.[0] || '👤'}
                            </span>
                        )}
                    </div>
                    <div className='pt-2'>
                        <p
                            className="
                            font-medium
                            text-primary
                            text-sm
                        ">
                            {post.user?.fullName || 'کاربر ناشناس'}
                        </p>
                        <p
                            className="
                            text-xs
                            text-secondary
                        ">
                            {post.user?.username || 'unknown'}@
                        </p>
                        <p className="
                        text-xs
                        text-secondary
                        ">
                            {formattedDate}
                        </p>
                    </div>
                </div>
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
                                            " />
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
                <div
                    className="
                flex
                gap-6
                pt-3
                border-t
                border-border
                text-sm
                text-secondary
                ">
                    <span>🕐 {formattedDate}</span>
                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                        <span>✏️ ویرایش شده</span>
                    )}
                </div>
            </div>
        </div >
    );
};