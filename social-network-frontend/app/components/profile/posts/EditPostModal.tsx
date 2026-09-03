// components/profile/posts/EditPostModal/index.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { TextBlock } from './EditPostModal/TextBlock';
import { ImageBlock } from './EditPostModal/ImageBlock';
import { VideoBlock } from './EditPostModal/VideoBlock';
import { UPDATE_POST } from '@/app/graphql/post.queries';
import { HeaderBlock } from './EditPostModal/HeaderBlock';
import { BlockTypeButtons } from './EditPostModal/BlockTypeButtons';
import { useEditPostBlocks } from './EditPostModal/useEditPostBlocks';

interface EditPostModalProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (updatedPost: any) => void;
}

export const EditPostModal = ({ post, isOpen, onClose, onSuccess }: EditPostModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        blocks,
        uploading,
        isUploadingMedia,
        addBlock,
        removeBlock,
        updateBlock,
        handleFileUpload,
        validate,
    } = useEditPostBlocks(post, isOpen);

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

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const content = JSON.stringify({ blocks });
            await updatePost({ variables: { postId: post.id, content } });
        } catch {
            setIsSubmitting(false);
        }
    };

    const canRemove = blocks.length > 1;

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
                max-w-3xl
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
                    ">ویرایش پست
                    </h1>
                    <button
                        onClick={onClose}
                        className="
                        p-1
                        hover:bg-border
                        rounded-lg
                        transition-colors
                        cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                <BlockTypeButtons onAdd={addBlock} />

                <div
                    className="
                space-y-2
                mb-4
                ">
                    {blocks.map((block, index) => {
                        switch (block.type) {
                            case 'header':
                                return (
                                    <HeaderBlock
                                        key={index}
                                        content={block.content}
                                        onChange={(v) => updateBlock(index, 'content', v)}
                                        onRemove={() => removeBlock(index)}
                                        canRemove={canRemove}
                                    />
                                );
                            case 'text':
                                return (
                                    <TextBlock
                                        key={index}
                                        content={block.content}
                                        onChange={(v) => updateBlock(index, 'content', v)}
                                        onRemove={() => removeBlock(index)}
                                        canRemove={canRemove}
                                    />
                                );
                            case 'image':
                                return (
                                    <ImageBlock
                                        key={index}
                                        url={block.url}
                                        caption={block.caption}
                                        isUploading={!!uploading[index]}
                                        onCaptionChange={(v) => updateBlock(index, 'caption', v)}
                                        onFileSelect={(file) => handleFileUpload(index, file)}
                                        onClearUrl={() => updateBlock(index, 'url', '')}
                                        onRemoveBlock={() => removeBlock(index)}
                                        canRemove={canRemove}
                                    />
                                );
                            case 'video':
                                return (
                                    <VideoBlock
                                        key={index}
                                        url={block.url}
                                        isUploading={!!uploading[index]}
                                        onFileSelect={(file) => handleFileUpload(index, file)}
                                        onClearUrl={() => updateBlock(index, 'url', '')}
                                        onRemoveBlock={() => removeBlock(index)}
                                        canRemove={canRemove}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </div>

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
                        hover:text-primary cursor-pointer
                        transition-colors"
                        disabled={isSubmitting}
                    >
                        انصراف
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploadingMedia}
                        className="
                        px-6
                        py-2
                        bg-primary
                        text-white
                        rounded-lg
                        hover:bg-primary cursor-pointer
                        transition-colors
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        flex
                        items-center
                        gap-2
                        ">
                        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                        {isSubmitting ? 'در حال ویرایش...' : 'ویرایش پست'}
                    </button>
                </div>
            </div>
        </div>
    );
};