'use client';

import { Bell } from 'lucide-react';
import {
    useState,
    useRef,
    useEffect
} from 'react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '@/app/hooks/useNotifications';

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        unreadCount,
        loading
    } = useNotifications();


    // ✅ بستن Dropdown با کلیک بیرون
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="اعلان‌ها"
                aria-expanded={isOpen}
                className="
                relative
                p-2
                rounded-xl
                hover:bg-border/50
                transition-colors
                cursor-pointer
                ">
                <Bell className="w-5 h-5 text-secondary" />
                <NotificationBadge count={unreadCount} />
            </button>

            {isOpen && (
                <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    loading={loading}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};