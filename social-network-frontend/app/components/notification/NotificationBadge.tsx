'use client';

interface NotificationBadgeProps {
    count: number;
}

export const NotificationBadge = ({ count }: NotificationBadgeProps) => {
    if (count === 0) return null;

    return (
        <span
            className="
            absolute
            -top-1
            -right-1
            min-w-[18px]
            h-[18px]
            px-1
            bg-red-500
            text-white
            text-[10px]
            font-bold
            rounded-full
            flex
            items-center
            justify-center
            border-2
            border-card
            animate-pulse
            ">
            {count > 99 ? '99+' : count}
        </span>
    );
};