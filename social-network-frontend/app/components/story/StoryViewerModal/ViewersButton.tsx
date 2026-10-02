// components/story/StoryViewerModal/ViewersButton.tsx
'use client';

import { Eye } from 'lucide-react';

interface ViewersButtonProps {
    viewsCount: number;
    onClick: () => void;
}

export const ViewersButton = ({ viewsCount, onClick }: ViewersButtonProps) => (
    <button
        onClick={onClick}
        className="
        absolute
        bottom-6
        left-4
        right-4
        z-20
        flex
        items-center
        justify-center
        gap-2
        py-3
        bg-white/10
        backdrop-blur-sm
        rounded-full
        text-white
        text-sm
        hover:bg-white/20
        transition-colors
        ">
        <Eye size={18} />
        {viewsCount} بازدید
    </button>
);