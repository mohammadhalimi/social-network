// components/profile/posts/types.test.ts
import { isContentBlock, isMediaBlock, ContentBlock } from '../types';

describe('types - type guards', () => {
    describe('isContentBlock', () => {
        it('returns true for header blocks', () => {
            const block: ContentBlock = { type: 'header', content: 'سلام' };
            expect(isContentBlock(block)).toBe(true);
        });

        it('returns true for text blocks', () => {
            const block: ContentBlock = { type: 'text', content: 'متن' };
            expect(isContentBlock(block)).toBe(true);
        });

        it('returns false for image blocks', () => {
            const block: ContentBlock = { type: 'image', url: 'x.png' };
            expect(isContentBlock(block)).toBe(false);
        });

        it('returns false for video blocks', () => {
            const block: ContentBlock = { type: 'video', url: 'x.mp4' };
            expect(isContentBlock(block)).toBe(false);
        });
    });

    describe('isMediaBlock', () => {
        it('returns true for image blocks', () => {
            const block: ContentBlock = { type: 'image', url: 'x.png' };
            expect(isMediaBlock(block)).toBe(true);
        });

        it('returns true for video blocks', () => {
            const block: ContentBlock = { type: 'video', url: 'x.mp4' };
            expect(isMediaBlock(block)).toBe(true);
        });

        it('returns false for header blocks', () => {
            const block: ContentBlock = { type: 'header', content: 'سلام' };
            expect(isMediaBlock(block)).toBe(false);
        });

        it('returns false for text blocks', () => {
            const block: ContentBlock = { type: 'text', content: 'متن' };
            expect(isMediaBlock(block)).toBe(false);
        });
    });
});