'use client';

interface LoadMoreButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

export const LoadMoreButton = ({ onClick, isLoading }: LoadMoreButtonProps) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className="
        w-full
        text-center
        text-sm
        text-primary
        hover:text-primary/80
        font-medium
        py-2
        hover:bg-primary/5
        rounded-xl
        transition-colors
    ">
        {isLoading ? (
            <span
                className="
                flex
                items-center
                justify-center
                gap-2
            ">
                <span
                    className="
                    w-4
                    h-4
                    border-2
                    border-primary
                    border-t-transparent
                    rounded-full
                    animate-spin
                "/>
                بارگذاری...
            </span>
        ) : (
            'مشاهده بیشتر'
        )}
    </button>
);