'use client';

import { ContentBlock } from './types';
import {
    Image,
    Video
} from 'lucide-react';


interface CreatePostHeaderProps {
    onAddBlock: (type: ContentBlock['type']) => void;
}

export const CreatePostHeader = ({ onAddBlock }: CreatePostHeaderProps) => {
    return (
        <div
            className="
            flex
            items-center
            justify-between
            mb-6
        ">
            <h1
                className="
                text-xl
                font-bold
                text-primary
            ">ایجاد پست جدید
            </h1>
            <div
                className="
                flex
                gap-2
            ">
                <button
                    onClick={() => onAddBlock('header')}
                    className="
                    p-2
                    bg-primary/10
                    text-primary
                    rounded-lg
                    hover:bg-primary/20
                    transition-colors
                    hover:cursor-pointer"
                    title="افزودن عنوان"
                >
                    <span
                        className="
                        font-bold
                        text-sm
                    ">
                        عنوان متن
                    </span>
                </button>
                <button
                    onClick={() => onAddBlock('text')}
                    className="
                    p-2
                    bg-primary/10
                    text-primary
                    rounded-lg
                    hover:bg-primary/20
                    transition-colors
                    hover:cursor-pointer"
                    title="افزودن متن"
                >
                    <span
                        className="
                        font-bold
                        text-sm
                    ">
                        متن
                    </span>
                </button>
                <button
                    onClick={() => onAddBlock('image')}
                    className="
                    p-2
                    bg-primary/10
                    text-primary
                    rounded-lg
                    hover:bg-primary/20
                    transition-colors
                    hover:cursor-pointer"
                    title="افزودن تصویر"
                >
                    <Image size={18} />
                </button>
                <button
                    onClick={() => onAddBlock('video')}
                    className="
                    p-2
                    bg-primary/10
                    text-primary
                    rounded-lg
                    hover:bg-primary/20
                    transition-colors
                    hover:cursor-pointer"
                    title="افزودن ویدیو"
                >
                    <Video size={18} />
                </button>
            </div>
        </div>
    );
};