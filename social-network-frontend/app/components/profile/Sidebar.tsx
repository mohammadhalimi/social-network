'use client';

import { motion } from 'framer-motion';
import { SidebarUserCard } from './SidebarUserCard';
import {
    User,
    Settings,
    Lock,
    LogOut,
    Cog
} from 'lucide-react';

const menuItems = [
    { id: 'profile', label: 'اطلاعات کاربری', icon: User },
    { id: 'edit', label: 'ویرایش اطلاعات', icon: Settings },
    { id: 'change-password', label: 'تغییر رمز عبور', icon: Lock },
    { id: 'settings', label: 'تنظیمات', icon: Cog },
];

interface SidebarProps {
    user: any;
    avatarUrl: string | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleLogout: () => void;
}

export const Sidebar = ({
    user,
    avatarUrl,
    activeTab,
    setActiveTab,
    handleLogout,
}: SidebarProps) => {
    const isActive = (id: string) => activeTab === id;

    return (
        <aside
            className="
            hidden
            lg:block
            lg:w-72
            flex-shrink-0
            ">
            <div
                className="
                sticky
                top-24
                ">
                <div
                    className="
                    bg-card
                    border
                    border-border
                    rounded-2xl
                    shadow-soft
                    p-5
                    ">
                    <SidebarUserCard
                        user={user}
                        avatarUrl={avatarUrl}
                    />
                    <nav
                        className="
                        flex-1
                        space-y-1.5
                        mt-4
                        ">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`
                                    w-full
                                    hover:cursor-pointer
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    rounded-xl
                                    text-sm
                                    transition-all
                                    duration-200
                                    text-right
                                    group
                                    ${active
                                        ?
                                        'bg-gradient-primary text-primary shadow-glow-primary'
                                        :
                                        'text-secondary hover:bg-primary/5 hover:text-primary'
                                    }
                                `}
                                >
                                    <Icon
                                        className={`
                                        w-5
                                        h-5
                                        ${active
                                            ?
                                            'text-primary'
                                            :
                                            'text-secondary group-hover:text-primary'
                                            }
                                     `}
                                    />
                                    <span
                                        className="
                                    font-medium
                                     ">
                                        {item.label}
                                    </span>
                                    {active && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="
                                            mr-auto
                                            w-1.5
                                            h-1.5
                                            rounded-full
                                            bg-primary
                                            "/>
                                    )}
                                </button>
                            );
                        })}

                        <button
                            onClick={handleLogout}
                            className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            rounded-xl
                            text-sm
                            text-red-500
                            hover:bg-red-50
                            transition-all
                            duration-200
                            mt-2
                            border-t
                            border-border
                            pt-4"
                        >
                            <LogOut
                            className="
                            w-5
                            h-5
                            "/>
                            <span
                            className="
                            font-medium
                            hover:cursor-pointer
                            ">خروج از حساب
                            </span>
                        </button>
                    </nav>
                </div>
            </div>
        </aside>
    );
};