// components/story/CreateStoryModal.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { X, Loader2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import {
    CREATE_STORY,
    GET_CLOSE_FRIENDS,
    StoryDuration,
    StoryVisibility,
} from '@/app/graphql/story.queries';
import { uploadStoryMedia } from '@/app/lib/uploadStory';
import { CloseFriendsSelector } from './CloseFriendsSelector'; // ✅ ایمپورت
import { useAppSelector } from '@/app/redux/hooks'; // ✅ برای userId

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const DURATION_OPTIONS: { value: StoryDuration; label: string }[] = [
    { value: 'SIX_HOURS', label: '۶ ساعت' },
    { value: 'TWELVE_HOURS', label: '۱۲ ساعت' },
    { value: 'EIGHTEEN_HOURS', label: '۱۸ ساعت' },
    { value: 'TWENTY_FOUR_HOURS', label: '۲۴ ساعت' },
];

const VISIBILITY_OPTIONS: { value: StoryVisibility; label: string }[] = [
    { value: 'PUBLIC', label: 'همه' },
    { value: 'FOLLOWERS', label: 'دنبال‌کنندگان' },
    { value: 'CLOSE_FRIENDS', label: 'دوستان نزدیک' },
];

export const CreateStoryModal = ({ isOpen, onClose, onSuccess }: CreateStoryModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [duration, setDuration] = useState<StoryDuration>('TWENTY_FOUR_HOURS');
    const [visibility, setVisibility] = useState<StoryVisibility>('FOLLOWERS');
    const [isUploading, setIsUploading] = useState(false);
    const [closeFriendsCount, setCloseFriendsCount] = useState(0); // ✅ برای شمارش

    const currentUser = useAppSelector(state => state.auth.user);

    const [createStory] = useMutation(CREATE_STORY, { errorPolicy: 'all' });

    if (!isOpen) return null;

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setMediaType(selectedFile.type.startsWith('video') ? 'video' : 'image');
    };

    const handleSubmit = async () => {
        if (!file) {
            toast.error('لطفاً یک عکس یا ویدیو انتخاب کنید');
            return;
        }

        // ✅ اگر CLOSE_FRIENDS انتخاب شده ولی کسی اضافه نشده، هشدار بده
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
                onClose();
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-text-primary">افزودن استوری</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-border rounded-lg transition-colors"
                        disabled={isUploading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* پیش‌نمایش / انتخاب فایل */}
                <div className="border-2 border-dashed border-border rounded-xl p-4 mb-4">
                    {previewUrl ? (
                        <div className="relative">
                            {mediaType === 'image' ? (
                                <img
                                    src={previewUrl}
                                    alt="پیش‌نمایش"
                                    className="w-full max-h-[300px] object-contain rounded-lg"
                                />
                            ) : (
                                <video
                                    src={previewUrl}
                                    controls
                                    className="w-full max-h-[300px] rounded-lg"
                                />
                            )}
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                            <div className="flex gap-3 mb-2">
                                <ImageIcon size={28} className="text-text-secondary" />
                                <VideoIcon size={28} className="text-text-secondary" />
                            </div>
                            <span className="text-text-secondary text-sm">
                                کلیک کنید تا عکس یا ویدیو انتخاب شود
                            </span>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => {
                                    const selected = e.target.files?.[0];
                                    if (selected) handleFileSelect(selected);
                                }}
                            />
                        </label>
                    )}
                </div>

                {/* انتخاب مدت زمان */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        مدت نمایش
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setDuration(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    duration === opt.value
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* انتخاب سطح دسترسی */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        چه کسانی ببینند؟
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {VISIBILITY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setVisibility(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    visibility === opt.value
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ✅ بخش انتخاب دوستان نزدیک */}
                {visibility === 'CLOSE_FRIENDS' && currentUser && (
                    <div className="mb-4">
                        <CloseFriendsSelector
                            userId={currentUser.id}
                            onChange={setCloseFriendsCount}
                        />
                    </div>
                )}

                {/* دکمه‌ها */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                        disabled={isUploading}
                    >
                        انصراف
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isUploading || !file}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading && <Loader2 size={18} className="animate-spin" />}
                        {isUploading ? 'در حال انتشار...' : 'انتشار استوری'}
                    </button>
                </div>
            </div>
        </div>
    );
};