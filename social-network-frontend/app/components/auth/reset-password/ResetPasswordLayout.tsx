'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ResetPasswordLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    icon: string;
}

export const ResetPasswordLayout = ({
    children,
    title,
    subtitle,
    icon,
}: ResetPasswordLayoutProps) => (
    <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        bg-background
  ">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
            w-full
            max-w-md
            ">
            <div
                className="
                bg-card
                border
                border-border
                rounded-2xl
                p-8
                shadow-soft
            ">
                <div
                    className="
                    text-center
                    mb-8
                ">
                    <div
                        className="
                        w-16
                        h-16
                        rounded-full
                        bg-gradient-primary
                        flex
                        items-center
                        justify-center
                        shadow-glow-primary
                        mx-auto
                        mb-4
                    ">
                        <span
                            className="
                            text-3xl
                            font-bold
                            text-white
                        ">
                            {icon}
                        </span>
                    </div>
                    <h2
                        className="
                        text-2xl
                        font-bold
                        text-primary
                    ">
                        {title}
                    </h2>
                    <p
                        className="
                        text-secondary
                        mt-2
                    ">
                        {subtitle}
                    </p>
                </div>
                {children}
            </div>
        </motion.div>
    </div>
);