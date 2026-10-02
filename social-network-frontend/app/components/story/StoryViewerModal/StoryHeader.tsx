// components/story/StoryViewerModal/StoryHeader.tsx
'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { StoryViewerUser } from './type';

interface StoryHeaderProps {
    user: StoryViewerUser;
    createdAt: string;
    onClose: () => void;
}

export const StoryHeader = ({ user, createdAt, onClose }: StoryHeaderProps) => (
    <div className="absolute top-8 left-4 right-4 z-20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-2 border-white/50">
            {user?.avatar ? (
                <Image
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                    unoptimized
                />
            ) : (
                <span className="text-white font-bold">
                    {user?.fullName?.[0] || '👤'}
                </span>
            )}
        </div>
        <div className="flex-1">
            <p className="text-white text-sm font-medium">{user?.fullName}</p>
            <p className="text-white/60 text-xs">
                {new Date(createdAt).toLocaleTimeString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </p>
        </div>
        <button
            onClick={onClose}
            className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
        >
            <X size={20} />
        </button>
    </div>
);