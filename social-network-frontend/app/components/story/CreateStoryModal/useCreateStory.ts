// components/story/CreateStoryModal/useCreateStory.ts
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { uploadStoryMedia } from '@/app/lib/uploadStory';
import { CREATE_STORY, StoryDuration, StoryVisibility } from '@/app/graphql/story.queries';

export const useCreateStory = (onSuccess?: () => void, onClose?: () => void) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [duration, setDuration] = useState<StoryDuration>('TWENTY_FOUR_HOURS');
    const [visibility, setVisibility] = useState<StoryVisibility>('FOLLOWERS');
    const [isUploading, setIsUploading] = useState(false);
    const [closeFriendsCount, setCloseFriendsCount] = useState(0);

    const [createStory] = useMutation(CREATE_STORY, { errorPolicy: 'all' });

    const selectFile = (selectedFile: File) => {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setMediaType(selectedFile.type.startsWith('video') ? 'video' : 'image');
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const submit = async () => {
        if (!file) {
            toast.error('لطفاً یک عکس یا ویدیو انتخاب کنید');
            return;
        }

        if (visibility === 'CLOSE_FRIENDS' && closeFriendsCount === 0) {
            toast.error('لطفاً حداقل یک دوست نزدیک انتخاب کنید');
            return;
        }

        setIsUploading(true);
        try {
            const mediaUrl = await uploadStoryMedia(file);

            const { data, error } = await createStory({
                variables: { mediaUrl, mediaType, duration, visibility },
            });

            if (error) {
                toast.error(error.message || 'خطا در ثبت استوری');
                return;
            }

            if (data?.createStory.success) {
                toast.success('استوری با موفقیت منتشر شد! ✅');
                onSuccess?.();
                onClose?.();
            } else {
                toast.error(data?.createStory.message || 'خطا در ثبت استوری');
            }
        } catch (err: any) {
            console.error('Error creating story:', err);
            toast.error(err.message || 'خطا در آپلود فایل');
        } finally {
            setIsUploading(false);
        }
    };

    return {
        file,
        previewUrl,
        mediaType,
        duration,
        setDuration,
        visibility,
        setVisibility,
        isUploading,
        closeFriendsCount,
        setCloseFriendsCount,
        selectFile,
        clearFile,
        submit,
    };
};