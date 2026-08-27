'use client';

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
        try {
            onUploadStateChange(index, true);
            onError(null as any); // پاک کردن خطای قبلی

            const url = await uploadPostMedia(file);
            onUpdateBlock(index, 'url', url);
            onError(null as any); // پاک کردن خطا بعد از موفقیت
        } catch (error: any) {
            console.warn('⚠️ خطای آپلود:', error.message);
            // ✅ ارور را به parent ارسال کن
            onError(error.message || 'خطا در آپلود فایل');
        } finally {
            onUploadStateChange(index, false);
        }
    };

    const renderBlock = (block: ContentBlock, index: number) => {
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
    };

    return <div
        className="
        space-y-3
    ">
        {blocks.map(renderBlock)}
    </div>;
};