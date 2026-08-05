'use client';

import { motion } from 'framer-motion';
import ProfileInfo from './ProfileInfo';
import ChangePassword from './ChangePassword';
import { EditProfileForm } from './EditProfile/EditProfile';

interface ProfileContentProps {
    user: any;
    loading: boolean;
    activeTab: string;
}

export const ProfileContent = ({ user, loading, activeTab }: ProfileContentProps) => {
    if (loading) {
        return (
            <div
                className="
            flex
            items-center
            justify-center
            min-h-[300px]">
                <div
                    className="text-center">
                    <div
                        className="
                    w-10
                    h-10
                    border-4
                border-primary
                border-t-transparent
                rounded-full
                animate-spin
                mx-auto"
                    />
                    <p
                        className="
                     mt-4
                    text-sm
                    text-text-secondary
          ">در حال بارگذاری...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div
                className="
            flex
            items-center
            justify-center
            min-h-[300px]
            ">
                <div
                    className="text-center">
                    <p
                        className="
                    text-text-secondary
          ">لطفاً وارد حساب خود شوید.
                    </p>
                    <button
                        onClick={() => window.location.href = '/auth/login'}
                        className="
                        mt-4
                        btn-primary
                        text-sm
                        px-6
                        py-2
                        ">
                        ورود
                    </button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileInfo user={user} />;
            case 'edit':
                return <EditProfileForm user={user} />;
            case 'change-password':
                return <ChangePassword />;
            default:
                return <ProfileInfo user={user} />;
        }
    };

    return (
        <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {renderContent()}
        </motion.div>
    );
};