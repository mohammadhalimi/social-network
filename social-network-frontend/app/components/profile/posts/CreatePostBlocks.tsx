'use client';

import toast from 'react-hot-toast';
import { ContentBlock } from './types';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { uploadPostMedia } from '@/app/lib/upload';
import { HeaderBlock } from './blocks/HeaderBlock';

interface CreatePostBlocksProps {
    blocks: ContentBlock[];
    uploading: { [key: number]: boolean };
    onUpdateBlock: (index: number, field: string, value: any) => void;
    onRemoveBlock: (index: number) => void;
    onUploadStateChange: (index: number, isLoading: boolean) => void;
    onError: (message: string) => void;
}

export const CreatePostBlocks = ({
    blocks,
    uploading,
    onUpdateBlock,
    onRemoveBlock,
    onUploadStateChange,
    onError,
}: CreatePostBlocksProps) => {
    const handleFileUpload = async (index: number, file: File, type: 'image' | 'video') => {
        const loadingToast = toast.loading('در حال آپلود فایل...', {
            style: {
                background: '#3B82F6',
                color: '#fff',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
            },
        });

        try {
            onUploadStateChange(index, true);
            onError(null as any);
            
            const url = await uploadPostMedia(file);
            onUpdateBlock(index, 'url', url);
            
            toast.dismiss(loadingToast);
            toast.success('فایل با موفقیت آپلود شد! 📁', {
                duration: 2000,
                icon: '✅',
                style: {
                    background: '#10B981',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
            });
            
            onError(null as any);
        } catch (error: any) {
            console.warn('⚠️ خطای آپلود:', error.message);
            
            toast.dismiss(loadingToast);
            toast.error(error.message || 'خطا در آپلود فایل', {
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
            
            onError(error.message || 'خطا در آپلود فایل');
        } finally {
            onUploadStateChange(index, false);
        }
    };

    return (
        <div className="space-y-3">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'header':
                        return (
                            <HeaderBlock
                                key={index}
                                block={block}
                                index={index}
                                onUpdate={onUpdateBlock}
                                onRemove={onRemoveBlock}
                                showRemoveButton={blocks.length > 1}
                            />
                        );
                    case 'text':
                        return (
                            <TextBlock
                                key={index}
                                block={block}
                                index={index}
                                onUpdate={onUpdateBlock}
                                onRemove={onRemoveBlock}
                                showRemoveButton={blocks.length > 1}
                            />
                        );
                    case 'image':
                        return (
                            <ImageBlock
                                key={index}
                                block={block}
                                index={index}
                                isUploading={uploading[index]}
                                onUpdate={onUpdateBlock}
                                onRemove={onRemoveBlock}
                                onUpload={handleFileUpload}
                                showRemoveButton={blocks.length > 1}
                            />
                        );
                    case 'video':
                        return (
                            <VideoBlock
                                key={index}
                                block={block}
                                index={index}
                                isUploading={uploading[index]}
                                onUpdate={onUpdateBlock}
                                onRemove={onRemoveBlock}
                                onUpload={handleFileUpload}
                                showRemoveButton={blocks.length > 1}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};