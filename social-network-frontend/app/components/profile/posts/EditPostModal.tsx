// components/profile/posts/EditPostModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { UPDATE_POST } from '@/app/graphql/post.queries';
import { X, Loader2, Image, Video, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadPostMedia } from '@/app/lib/upload';

type ContentBlock =
    | { type: 'header'; content: string }
    | { type: 'text'; content: string }
    | { type: 'image'; url: string; caption?: string }
    | { type: 'video'; url: string };

interface EditPostModalProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (updatedPost: any) => void;
}

export const EditPostModal = ({ post, isOpen, onClose, onSuccess }: EditPostModalProps) => {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    const [updatePost] = useMutation(UPDATE_POST, {
        onCompleted: (data) => {
            setIsSubmitting(false);

            toast.success('پست با موفقیت ویرایش شد! ✅');

            onSuccess?.(data.updatePost.post);

            onClose();
        },
        onError: (error: any) => {
            console.error('Error updating post:', error);
            setIsSubmitting(false);
            toast.error(error.message || 'خطا در ویرایش پست');
        },
    });

    // ✅ پارس کردن محتوای پست به بلاک‌ها
    useEffect(() => {
        if (post?.content && isOpen) {
            try {
                const parsed = JSON.parse(post.content);
                setBlocks(parsed.blocks || []);
            } catch {
                setBlocks([{ type: 'text', content: post.content }]);
            }
        }
    }, [post, isOpen]);

    if (!isOpen) return null;

    // ✅ افزودن بلاک جدید
    const addBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock =
            type === 'header' ? { type: 'header', content: '' } :
                type === 'image' ? { type: 'image', url: '', caption: '' } :
                    type === 'video' ? { type: 'video', url: '' } :
                        { type: 'text', content: '' };
        setBlocks([...blocks, newBlock]);
    };

    // ✅ حذف بلاک
    const removeBlock = (index: number) => {
        if (blocks.length <= 1) return;
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    // ✅ آپدیت بلاک
    const updateBlock = (index: number, field: string, value: any) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], [field]: value };
        setBlocks(newBlocks);
    };

    // ✅ آپلود فایل جدید
    const handleFileUpload = async (index: number, file: File, type: 'image' | 'video') => {
        try {
            setIsUploadingMedia(true);
            setUploading(prev => ({ ...prev, [index]: true }));

            const url = await uploadPostMedia(file);
            updateBlock(index, 'url', url);

            toast.success('فایل با موفقیت آپلود شد! 📁');
        } catch (error: any) {
            console.error('Error uploading file:', error);
            toast.error(error.message || 'خطا در آپلود فایل');
        } finally {
            setUploading(prev => ({ ...prev, [index]: false }));
            setIsUploadingMedia(false);
        }
    };

    const handleSubmit = async () => {
        // ✅ اعتبارسنجی
        const hasHeader = blocks.some(b => b.type === 'header' && b.content.trim());
        const hasText = blocks.some(b => b.type === 'text' && b.content.trim());

        if (!hasHeader || !hasText) {
            toast.error('لطفاً حداقل یک عنوان و یک متن وارد کنید');
            return;
        }

        // ✅ بررسی آپلود فایل‌ها
        const hasUploading = Object.values(uploading).some(u => u === true);
        if (hasUploading || isUploadingMedia) {
            toast.error('لطفاً منتظر بمانید تا فایل‌ها آپلود شوند');
            return;
        }

        setIsSubmitting(true);
        try {
            const content = JSON.stringify({ blocks });
            await updatePost({
                variables: { postId: post.id, content },
            });
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    const renderBlock = (block: ContentBlock, index: number) => {
        switch (block.type) {
            case 'header':
                return (
                    <div key={index} className="relative mb-3 group">
                        <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlock(index, 'content', e.target.value)}
                            placeholder="عنوان پست را وارد کنید..."
                            className="w-full text-xl font-bold bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary outline-none py-2 text-text-primary placeholder:text-text-secondary"
                        />
                        {blocks.length > 1 && (
                            <button
                                onClick={() => removeBlock(index)}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                );
            case 'text':
                return (
                    <div key={index} className="relative mb-3 group">
                        <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(index, 'content', e.target.value)}
                            placeholder="متن پست را بنویسید..."
                            className="w-full bg-transparent border border-border rounded-xl focus:border-primary outline-none p-3 text-text-primary placeholder:text-text-secondary min-h-[80px]"
                        />
                        {blocks.length > 1 && (
                            <button
                                onClick={() => removeBlock(index)}
                                className="absolute -left-8 top-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <div key={index} className="relative mb-3 group">
                        <div className="border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                            {block.url ? (
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={block.url}
                                        alt="تصویر"
                                        className="w-full h-auto rounded-lg max-h-[300px] object-contain"
                                    />
                                    <input
                                        type="text"
                                        value={block.caption || ''}
                                        onChange={(e) => updateBlock(index, 'caption', e.target.value)}
                                        placeholder="توضیح تصویر (اختیاری)"
                                        className="w-full mt-2 bg-transparent border border-border rounded-lg p-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary outline-none"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <label className="p-1 bg-black/50 hover:bg-black/70 text-white rounded-full cursor-pointer transition-colors">
                                            <Upload size={14} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(index, file, 'image');
                                                }}
                                            />
                                        </label>
                                        <button
                                            onClick={() => updateBlock(index, 'url', '')}
                                            className="p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {uploading[index] && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                            <Loader2 size={32} className="text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                                    {uploading[index] ? (
                                        <Loader2 size={32} className="text-primary animate-spin mb-2" />
                                    ) : (
                                        <>
                                            <Image size={32} className="text-text-secondary mb-2" />
                                            <span className="text-text-secondary text-sm">کلیک کنید تا تصویر آپلود شود</span>
                                            <span className="text-text-secondary text-xs mt-1">(JPG, PNG, WebP - حداکثر 5MB)</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(index, file, 'image');
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                        {blocks.length > 1 && (
                            <button
                                onClick={() => removeBlock(index)}
                                className="absolute -left-8 top-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                );
            case 'video':
                return (
                    <div key={index} className="relative mb-3 group">
                        <div className="border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                            {block.url ? (
                                <div className="relative">
                                    <video
                                        src={block.url}
                                        controls
                                        className="w-full h-auto rounded-lg max-h-[300px]"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <label className="p-1 bg-black/50 hover:bg-black/70 text-white rounded-full cursor-pointer transition-colors">
                                            <Upload size={14} />
                                            <input
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(index, file, 'video');
                                                }}
                                            />
                                        </label>
                                        <button
                                            onClick={() => updateBlock(index, 'url', '')}
                                            className="p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {uploading[index] && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                            <Loader2 size={32} className="text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                                    {uploading[index] ? (
                                        <Loader2 size={32} className="text-primary animate-spin mb-2" />
                                    ) : (
                                        <>
                                            <Video size={32} className="text-text-secondary mb-2" />
                                            <span className="text-text-secondary text-sm">کلیک کنید تا ویدیو آپلود شود</span>
                                            <span className="text-text-secondary text-xs mt-1">(MP4, WebM - حداکثر 50MB)</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(index, file, 'video');
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                        {blocks.length > 1 && (
                            <button
                                onClick={() => removeBlock(index)}
                                className="absolute -left-8 top-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* هدر */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-text-primary">ویرایش پست</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-border rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* دکمه‌های افزودن بلاک */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => addBlock('header')}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                    >
                        عنوان
                    </button>
                    <button
                        onClick={() => addBlock('text')}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                    >
                        متن
                    </button>
                    <button
                        onClick={() => addBlock('image')}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                    >
                        تصویر
                    </button>
                    <button
                        onClick={() => addBlock('video')}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                    >
                        ویدیو
                    </button>
                </div>

                {/* بلاک‌ها */}
                <div className="space-y-2 mb-4">
                    {blocks.map((block, index) => renderBlock(block, index))}
                </div>

                {/* دکمه‌ها */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                        disabled={isSubmitting}
                    >
                        انصراف
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploadingMedia}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                        {isSubmitting ? 'در حال ویرایش...' : 'ویرایش پست'}
                    </button>
                </div>
            </div>
        </div>
    );
};