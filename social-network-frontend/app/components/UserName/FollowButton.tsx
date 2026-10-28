'use client';

import { Loader2 } from 'lucide-react';
import { FOLLOW_STATE_CONFIG } from './FollowButton/constants';
import { useFollowButton } from './FollowButton/useFollowButton';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing: boolean;
    initialIsPending?: boolean;
    onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
}

export const FollowButton = (props: FollowButtonProps) => {
    const { state, isLoading, handleClick } = useFollowButton(props);
    const { text, Icon, classes } = FOLLOW_STATE_CONFIG[state];

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            data-testid="follow-button"
            data-state={state}
            data-loading={isLoading}
            className={`
                flex
                items-center
                gap-2
                px-6
                py-2
                rounded-lg
                text-sm
                font-medium
                transition-colors
                disabled:opacity-60
                cursor-pointer
                ${classes}
            `}
        >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
            {text}
        </button>
    );
};