// components/story/StoryViewerModal/ViewersModal.tsx
'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { StoryViewerEntry } from './type';

interface ViewersModalProps {
    viewers: StoryViewerEntry[];
    onClose: () => void;
}

export const ViewersModal = ({ viewers, onClose }: ViewersModalProps) => (
    <div
        className="
        fixed
        inset-0
        bg-black/80
        z-[110]
        flex
        items-end
        justify-center
    "
        onClick={onClose}>
        <div
            className="
            bg-card
            rounded-t-3xl
            w-full
            max-w-md
            max-h-[60vh]
            overflow-y-auto
            p-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="
                flex
                items-center
                justify-between
                mb-4
            ">
                <h1
                    className="
                    text-lg
                    font-bold
                    text-primary
                ">
                    بازدیدکنندگان ({viewers.length})
                </h1>
                <button
                    onClick={onClose}
                    className="
                    p-1
                    hover:bg-border
                    rounded-lg
                ">
                    <X size={20} />
                </button>
            </div>
            {viewers.length === 0 ? (
                <p
                    className="
                    text-center
                    text-secondary
                    py-4
                ">
                    هنوز کسی این استوری را ندیده
                </p>
            ) : (
                <div
                    className="
                    space-y-3
                ">
                    {viewers.map((v, idx) => (
                        <div
                            key={idx}
                            className="
                            flex
                            items-center
                            gap-3
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
                            ">
                                {v.user.avatar ? (
                                    <Image
                                        src={v.user.avatar}
                                        alt={v.user.fullName}
                                        className="w-full h-full object-cover"
                                        width={40}
                                        height={40}
                                        unoptimized
                                    />
                                ) : (
                                    <span
                                        className="
                                        text-white
                                        font-bold
                                    ">
                                        {v.user.fullName?.[0] || '👤'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p
                                    className="
                                    text-sm
                                    font-medium
                                    text-primary
                                ">
                                    {v.user.fullName}
                                </p>
                                <p
                                    className="
                                    text-xs
                                    text-secondary
                                ">
                                    @{v.user.username}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);