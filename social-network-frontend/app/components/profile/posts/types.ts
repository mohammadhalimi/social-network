// components/profile/posts/types.ts

export type ContentBlock = 
  | { type: 'header'; content: string }
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'video'; url: string };

// ✅ Type Guard برای بلاک‌های دارای content
export const isContentBlock = (block: ContentBlock): block is Extract<ContentBlock, { content: string }> => {
    return block.type === 'header' || block.type === 'text';
};

// ✅ Type Guard برای بلاک‌های دارای url (media)
export const isMediaBlock = (block: ContentBlock): block is Extract<ContentBlock, { url: string }> => {
    return block.type === 'image' || block.type === 'video';
};

export interface BlockProps {
    block: ContentBlock;
    index: number;
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
}