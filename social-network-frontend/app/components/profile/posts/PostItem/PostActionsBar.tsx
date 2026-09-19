'use client';

import {
    Eye,
    Edit,
    Trash2
} from 'lucide-react';

interface PostActionsBarProps {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const PostActionsBar = ({ onView, onEdit, onDelete }: PostActionsBarProps) => {
    return (
        <div
            className="
            flex
            items-center
            justify-end
            gap-1
            pt-3
            border-t
            border-border
        ">
            <button
                onClick={onView}
                className="
                p-2
                text-secondary
                hover:text-primary
                hover:bg-primary/10
                rounded-lg
                transition-colors
                cursor-pointer"
                title="مشاهده کامل"
            >
                <Eye size={18} />
            </button>
            <button
                onClick={onEdit}
                className="
                p-2
                text-secondary
                hover:text-blue-500
                hover:bg-blue-500/10
                rounded-lg
                transition-colors
                cursor-pointer"
                title="ویرایش"
            >
                <Edit size={18} />
            </button>
            <button
                onClick={onDelete}
                className="
                p-2
                text-secondary
                hover:text-red-500
                hover:bg-red-500/10
                rounded-lg
                transition-colors
                cursor-pointer"
                title="حذف"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};