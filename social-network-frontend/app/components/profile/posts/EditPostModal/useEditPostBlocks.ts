'use client';

import toast from 'react-hot-toast';
import {
    useState,
    useEffect
} from 'react';
import { uploadPostMedia } from '@/app/lib/upload';
import type {
    ContentBlock,
    BlockUploadingState
} from './type';

export const useEditPostBlocks = (post: any, isOpen: boolean) => {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [uploading, setUploading] = useState<BlockUploadingState>({});
    

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

    const addBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock =
            type === 'header' ? { type: 'header', content: '' } :
                type === 'image' ? { type: 'image', url: '', caption: '' } :
                    type === 'video' ? { type: 'video', url: '' } :
                        { type: 'text', content: '' };
        setBlocks(prev => [...prev, newBlock]);
    };

    const removeBlock = (index: number) => {
        setBlocks(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    };

    const updateBlock = (index: number, field: string, value: any) => {
        setBlocks(prev => {
            const newBlocks = [...prev];
            newBlocks[index] = { ...newBlocks[index], [field]: value };
            return newBlocks;
        });
    };

    const handleFileUpload = async (index: number, file: File) => {
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

    const isAnyFileUploading = Object.values(uploading).some(u => u === true) || isUploadingMedia;

    const validate = (): boolean => {
        const hasHeader = blocks.some(b => b.type === 'header' && b.content.trim());
        const hasText = blocks.some(b => b.type === 'text' && b.content.trim());

        if (!hasHeader || !hasText) {
            toast.error('لطفاً حداقل یک عنوان و یک متن وارد کنید');
            return false;
        }
        if (isAnyFileUploading) {
            toast.error('لطفاً منتظر بمانید تا فایل‌ها آپلود شوند');
            return false;
        }
        return true;
    };

    return {
        blocks,
        uploading,
        isUploadingMedia,
        addBlock,
        removeBlock,
        updateBlock,
        handleFileUpload,
        validate,
    };
};