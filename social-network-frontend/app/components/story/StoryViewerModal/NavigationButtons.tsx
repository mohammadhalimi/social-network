// components/story/StoryViewerModal/NavigationButtons.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
    canGoPrev: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export const NavigationButtons =
    ({
        canGoPrev,
        onPrev,
        onNext
    }: NavigationButtonsProps) => (
        <>
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={!canGoPrev}
                className="
            absolute
            left-2
            top-1/2
            -translate-y-1/2
            w-10
            h-10
            flex
            items-center
            justify-center
            text-white/70
            hover:text-white
            disabled:opacity-20
            transition-colors
            z-20
            ">
                <ChevronLeft size={32} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="
            absolute
            right-2
            top-1/2
            -translate-y-1/2
            w-10
            h-10
            flex
            items-center
            justify-center
            text-white/70
            hover:text-white
            transition-colors
            z-20
            ">
                <ChevronRight size={32} />
            </button>
        </>
    );