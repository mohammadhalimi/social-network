import { UserPlus, UserCheck, Clock } from 'lucide-react';

export type FollowState = 'not-following' | 'pending' | 'following';

export const FOLLOW_STATE_CONFIG = {
    'not-following': {
        text: 'دنبال کردن',
        Icon: UserPlus,
        classes: 'bg-primary text-white hover:bg-secondary',
    },
    pending: {
        text: 'در انتظار تأیید',
        Icon: Clock,
        classes: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 hover:bg-yellow-500/20',
    },
    following: {
        text: 'دنبال می‌کنید',
        Icon: UserCheck,
        classes: 'bg-border text-primary hover:bg-red-500/10 hover:text-red-500',
    },
} as const;