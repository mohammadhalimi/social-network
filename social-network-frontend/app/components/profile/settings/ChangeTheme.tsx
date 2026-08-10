'use client';

import { Sun, Moon, } from 'lucide-react';
import { toggleTheme } from '@/app/redux/features/themeSlice';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';

export const ChangeTheme = () => {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.theme);

    const handleToggleTheme = () => {
        dispatch(toggleTheme());
    };
    
    return (

        <div
            className="
      space-y-6
      ">
            <div
                className="
            bg-background/50
            dark:bg-gray-800/50
            rounded-xl
            p-5
            border
            border-border/50
            ">
                <div
                    className="
                flex
                items-center
                justify-between
                ">
                    <div
                        className="
                    flex
                    items-center
                    gap-3
                    ">
                        {theme === 'dark' ? (
                            <Moon
                                className="
                            w-5
                            h-5
                            text-primary
                            "/>
                        ) : (
                            <Sun
                                className="
                            w-5
                            h-5
                            text-primary
                            "/>
                        )}
                        <div>
                            <p
                                className="
                            font-medium
                            text-primary
                            ">تم
                            </p>
                            <p
                                className="
                            text-sm
                            text-secondary
                            ">
                                {theme === 'dark' ? 'تم تاریک' : 'تم روشن'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleTheme}
                        className="
                        relative
                        w-14
                        h-8
                        rounded-full
                        bg-gray-200
                        dark:bg-gray-700
                        transition-colors
                        duration-300
                        flex-shrink-0
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-primary/40
                        hover:cursor-pointer"
                        aria-label="تغییر تم"
                        data-testid="theme-toggle"
                    >
                        <span
                            className={`
                absolute
                top-1
                left-1
                w-6
                h-6
                rounded-full
                bg-white
                shadow-md
                transition-all
                duration-300
                  ${theme
                                    ===
                                    'dark'
                                    ?
                                    'translate-x-6'
                                    :
                                    'translate-x-0'}
                `}
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}