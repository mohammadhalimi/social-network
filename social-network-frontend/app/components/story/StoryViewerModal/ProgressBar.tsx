// components/story/StoryViewerModal/ProgressBar.tsx
'use client';

interface ProgressBarProps {
    total: number;
    currentIndex: number;
    progress: number;
}

export const ProgressBar = ({ total, currentIndex, progress }: ProgressBarProps) => (
    <div dir="ltr" className="absolute top-4 left-4 right-4 z-20 flex gap-1">
        {Array.from({ length: total }).map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{
                        width:
                            idx < currentIndex ? '100%' :
                            idx === currentIndex ? `${progress}%` :
                            '0%',
                    }}
                />
            </div>
        ))}
    </div>
);