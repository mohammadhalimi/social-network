// components/story/CreateStoryModal/index.tsx
'use client';

import { X, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/app/redux/hooks';
import { MediaPicker } from './CreateStoryModal/MediaPicker';
import { CloseFriendsSelector } from './CloseFriendsSelector';
import { useCreateStory } from './CreateStoryModal/useCreateStory';
import { DurationSelector } from './CreateStoryModal/DurationSelector';
import { VisibilitySelector } from './CreateStoryModal/VisibilitySelector';

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateStoryModal = ({ isOpen, onClose, onSuccess }: CreateStoryModalProps) => {
    const currentUser = useAppSelector(state => state.auth.user);

    const {
        file,
        previewUrl,
        mediaType,
        duration,
        setDuration,
        visibility,
        setVisibility,
        isUploading,
        setCloseFriendsCount,
        selectFile,
        clearFile,
        submit,
    } = useCreateStory(onSuccess, onClose);

    if (!isOpen) return null;

    return (
        <div
            className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
        p-4
        ">
            <div
                className="
            bg-card
            rounded-2xl
            p-6
            max-w-md
            w-full
            max-h-[90vh]
            overflow-y-auto
            shadow-xl
            ">
                <div
                    className="
                flex
                items-center
                justify-between
                mb-4
                ">
                    <h1
                        className="
                    text-xl
                    font-bold
                    text-primary
                    ">
                        افزودن استوری
                    </h1>
                    <button
                        onClick={onClose}
                        className="
                        p-1
                        hover:bg-border
                        rounded-lg
                        transition-colors"
                        disabled={isUploading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <MediaPicker
                    previewUrl={previewUrl}
                    mediaType={mediaType}
                    onSelect={selectFile}
                    onClear={clearFile}
                />

                <DurationSelector value={duration} onChange={setDuration} />

                <VisibilitySelector value={visibility} onChange={setVisibility} />

                {visibility === 'CLOSE_FRIENDS' && currentUser && (
                    <div className="mb-4">
                        <CloseFriendsSelector
                            userId={currentUser.id}
                            onChange={setCloseFriendsCount}
                        />
                    </div>
                )}

                <div
                className="
                flex
                justify-end
                gap-3
                pt-4
                border-t
                border-border
                ">
                    <button
                        onClick={onClose}
                        className="
                        px-4
                        py-2
                        text-secondary
                        hover:text-primary
                        transition-colors"
                        disabled={isUploading}
                    >
                        انصراف
                    </button>
                    <button
                        onClick={submit}
                        disabled={isUploading || !file}
                        className="
                        px-6
                        py-2
                        bg-primary
                        text-white
                        rounded-lg
                        hover:bg-secondary
                        transition-colors
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        flex
                        items-center
                        gap-2"
                    >
                        {isUploading && <Loader2 size={18} className="animate-spin" />}
                        {isUploading ? 'در حال انتشار...' : 'انتشار استوری'}
                    </button>
                </div>
            </div>
        </div>
    );
};