'use client';


import { RemoveBlockButton } from './RemoveBlockButton';
import {
    Loader2,
    Video as VideoIcon,
    Upload,
    X
} from 'lucide-react';

interface VideoBlockProps {
    url: string;
    isUploading: boolean;
    onFileSelect: (file: File) => void;
    onClearUrl: () => void;
    onRemoveBlock: () => void;
    canRemove: boolean;
}

export const VideoBlock = ({
    url,
    isUploading,
    onFileSelect,
    onClearUrl,
    onRemoveBlock,
    canRemove,
}: VideoBlockProps) => {
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    return (
        <div
            className="
            relative
            mb-3
            group
        ">
            <div
                className="
                border-2
                border-dashed
                border-border
                rounded-xl
                p-4
                hover:border-primary/50
                transition-colors
            ">
                {url ? (
                    <div
                        className="
                        relative
                    ">
                        <video
                            src={url}
                            controls
                            className="
                            w-full
                            h-auto
                            rounded-lg
                            max-h-[300px]
                        "/>
                        <div
                            className="
                            absolute
                            top-2
                            right-2
                            flex
                            gap-1
                        ">
                            <label
                                className="
                                p-1
                                bg-black/50
                                hover:bg-black/70
                                text-white
                                rounded-full
                                cursor-pointer
                                transition-colors
                            ">
                                <Upload
                                    size={14}
                                />
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                            </label>
                            <button
                                onClick={onClearUrl}
                                className="
                                p-1
                                bg-black/50
                                hover:bg-black/70
                                text-white
                                rounded-full
                                transition-colors
                                ">
                                <X
                                    size={14}
                                />
                            </button>
                        </div>
                        {isUploading && (
                            <div
                                className="
                                absolute
                                inset-0
                                bg-black/50
                                flex
                                items-center
                                justify-center
                                rounded-lg
                            ">
                                <Loader2
                                    size={32}
                                    className="
                                    text-white
                                    animate-spin
                                "/>
                            </div>
                        )}
                    </div>
                ) : (
                    <label
                        className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        cursor-pointer
                        py-6
                    ">
                        {isUploading ? (
                            <Loader2
                                size={32}
                                className="
                                text-primary
                                animate-spin
                                mb-2
                            "/>
                        ) : (
                            <>
                                <VideoIcon
                                    size={32}
                                    className="
                                    text-secondary
                                    mb-2
                                "/>
                                <span
                                    className="
                                    text-secondary
                                    text-sm
                                ">کلیک کنید تا ویدیو آپلود شود
                                </span>
                                <span
                                    className="
                                    text-secondary
                                    text-xs
                                    mt-1
                                ">
                                    (MP4, WebM - حداکثر 50MB)
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleFileInput}
                        />
                    </label>
                )}
            </div>
            <RemoveBlockButton onClick={onRemoveBlock} visible={canRemove} />
        </div>
    );
};