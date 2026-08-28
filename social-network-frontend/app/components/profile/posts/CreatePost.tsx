'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ContentBlock } from './types';
import { useMutation } from '@apollo/client/react';
import { CreatePostHeader } from './CreatePostHeader';
import { CreatePostBlocks } from './CreatePostBlocks';
import { CreatePostActions } from './CreatePostActions';
import { CREATE_POST } from '@/app/graphql/post.queries';

export const CreatePost = () => {
    const [blocks, setBlocks] = useState<ContentBlock[]>([
        { type: 'header', content: '' },
        { type: 'text', content: '' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

    const [createPost] = useMutation(CREATE_POST, {
        onCompleted: () => {
            setIsSubmitting(false);

            toast.success('پست شما با موفقیت منتشر شد! 🎉', {
                duration: 3000,
                icon: '✅',
                style: {
                    background: '#10B981',
                    color: '#fff',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
            });

            // ✅ ریست کردن فرم بعد از موفقیت
            resetForm();
        },
        onError: (error) => {
            console.error('Error creating post:', error);
            setIsSubmitting(false);

            let message = error.message || 'خطا در ایجاد پست';

            if (error.message.includes('احراز هویت') ||
                error.message.includes('توکن') ||
                error.message.includes('login')) {
                message = 'لطفاً ابتدا وارد حساب کاربری خود شوید.';
            }

            toast.error(message, {
                duration: 5000,
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
            });
        },
    });

    // ✅ تابع ریست کردن فرم
    const resetForm = () => {
        setBlocks([
            { type: 'header', content: '' },
            { type: 'text', content: '' },
        ]);
        setUploading({});
        setIsSubmitting(false);
    };

    const addBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock =
            type === 'header' ? { type: 'header', content: '' } :
                type === 'image' ? { type: 'image', url: '', caption: '' } :
                    type === 'video' ? { type: 'video', url: '' } :
                        { type: 'text', content: '' };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (index: number) => {
        if (blocks.length <= 1) return;
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const updateBlock = (index: number, field: string, value: any) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], [field]: value };
        setBlocks(newBlocks);
    };

    const setUploadingState = (index: number, isLoading: boolean) => {
        setUploading(prev => ({ ...prev, [index]: isLoading }));
    };

    const handleSubmit = async () => {
        const hasHeader = blocks.some(b => b.type === 'header' && b.content.trim());
        const hasText = blocks.some(b => b.type === 'text' && b.content.trim());

        if (!hasHeader || !hasText) {
            toast.error('لطفاً حداقل یک عنوان و یک متن وارد کنید', {
                duration: 4000,
                icon: '⚠️',
                style: {
                    background: '#F59E0B',
                    color: '#fff',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
            });
            return;
        }

        const hasUploading = Object.values(uploading).some(u => u === true);
        if (hasUploading) {
            toast.loading('در حال آپلود فایل‌ها...', {
                duration: 2000,
                style: {
                    background: '#3B82F6',
                    color: '#fff',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const cleanedBlocks = blocks.filter(block => {
                if (block.type === 'header' || block.type === 'text') {
                    return block.content.trim();
                }
                if (block.type === 'image' || block.type === 'video') {
                    return block.url;
                }
                return true;
            });

            const content = JSON.stringify({ blocks: cleanedBlocks });

            const loadingToast = toast.loading('در حال ارسال پست...', {
                style: {
                    background: '#3B82F6',
                    color: '#fff',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
            });

            await createPost({ variables: { content } });
            toast.dismiss(loadingToast);

        } catch (error) {
            console.error('Error:', error);
            setIsSubmitting(false);
        }
    };

    const contentCount = blocks.filter(b =>
        (b.type === 'header' || b.type === 'text') && b.content.trim()
    ).length;

    return (
        <div
            className="
            max-w-3xl
            mx-auto
            p-6
            bg-card
            rounded-2xl
            shadow-soft
        ">
            <CreatePostHeader onAddBlock={addBlock} />

            <CreatePostBlocks
                blocks={blocks}
                uploading={uploading}
                onUpdateBlock={updateBlock}
                onRemoveBlock={removeBlock}
                onUploadStateChange={setUploadingState}
                onError={(message) => {
                    if (message) {
                        toast.error(message, {
                            duration: 5000,
                            icon: '❌',
                            style: {
                                background: '#EF4444',
                                color: '#fff',
                                padding: '16px 24px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                            },
                        });
                    }
                }}
            />

            <CreatePostActions
                blocksCount={blocks.length}
                contentCount={contentCount}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={resetForm}
            />
        </div>
    );
};