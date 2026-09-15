// components/profile/posts/ReplyItem.tsx
'use client';

import Image from 'next/image';
import { PostReply } from './types';
import { formatPersianDate } from '@/app/lib/formatDate';


interface ReplyItemProps {
    reply: PostReply;
}

export const ReplyItem = ({ reply }: ReplyItemProps) => {
    return (
        <div
            className="
            flex
            items-start
            gap-2
        ">
            <div
                className="
                w-7
                h-7
                rounded-full
                bg-gradient-primary
                flex
                items-center
                justify-center
                overflow-hidden
                flex-shrink-0
            ">
                {reply.user?.avatar ? (
                    <Image
                        src={reply.user.avatar}
                        alt={reply.user.fullName}
                        className="
                        w-full
                        h-full
                        object-cover"
                        width={28}
                        height={28}
                        unoptimized
                    />
                ) : (
                    <span
                        className="
                        text-white
                        font-bold
                        text-[10px]
                    ">
                        {reply.user?.fullName?.[0] || '👤'}
                    </span>
                )}
            </div>
            <div
                className="
                flex-1
                min-w-0
            ">
                <div
                    className="
                    bg-primary/5
                    border
                    border-primary/10
                    rounded-xl
                    rounded-tr-sm
                    px-3
                    py-2
                ">
                    <p
                        className="
                        text-[11px]
                        font-bold
                        text-primary
                        mb-0.5
                    ">
                        {reply.user?.fullName || reply.user?.username}
                    </p>
                    <p
                        className="
                        text-xs
                        text-primary
                        whitespace-pre-wrap
                        leading-relaxed
                    ">
                        {reply.content}
                    </p>
                </div>
                <span
                    className="
                    text-[10px]
                    text-secondary
                    mt-1
                    block
                    px-1
                ">
                    {formatPersianDate(reply.createdAt)}
                </span>
            </div>
        </div>
    );
};