'use client';

import { ProfileUser } from './types';
import {
    User,
    FileText
} from 'lucide-react';

interface ProfileInfoProps {
    user: ProfileUser;
}

export const ProfileInfo = ({ user }: ProfileInfoProps) => {
    return (
        <dl
            className="
            divide-y
            divide-border
        ">
            <div
                className="
                grid
                grid-cols-1
                sm:grid-cols-4
                gap-1
                sm:gap-4
                py-4
                first:pt-0
                last:pb-0
            ">
                <dt
                    className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-secondary
                    sm:col-span-1
                ">
                    <User
                        className="
                        w-4
                        h-4
                    "/>
                    نام کاربری
                </dt>
                <dd
                    className="
                    text-sm
                    sm:col-span-3
                    font-medium
                    text-primary
                ">
                    {user.username}@
                </dd>
            </div>

            <div
                className="
                grid
                grid-cols-1
                sm:grid-cols-4
                gap-1
                sm:gap-4
                py-4
                first:pt-0
                last:pb-0
            ">
                <dt
                    className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-secondary
                    sm:col-span-1
                ">
                    <FileText
                        className="
                        w-4
                        h-4
                    "/>
                    بیوگرافی
                </dt>
                <dd
                    className="
                    text-sm
                    sm:col-span-3
                    font-medium
                    text-primary
                ">
                    {user.bio || 'هنوز بیوگرافی وارد نشده است'}
                </dd>
            </div>
        </dl>
    );
};