'use client';

import { Bell } from 'lucide-react';

export const NotificationBell = () => {
    return (
        <button
            className="
            relative
            p-2
            rounded-xl
            hover:bg-border/50
            transition-colors
            ">
            <Bell
                className="
                w-5
                h-5
                text-secondary
            "/>
        </button>
    );
};