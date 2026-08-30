import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContentBlock } from '../types';

// ==========================================================
// Mock: toast
// ==========================================================
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        loading: jest.fn(() => 'toast-id'),
        success: jest.fn(),
        error: jest.fn(),
        dismiss: jest.fn(),
    },
}));
import toast from 'react-hot-toast';

// ==========================================================
// Mock: uploadPostMedia
// ==========================================================
jest.mock('@/app/lib/upload', () => ({
    uploadPostMedia: jest.fn(),
}));
import { uploadPostMedia } from '@/app/lib/upload';

// ==========================================================
// Mock: block components
// ==========================================================
jest.mock('../blocks/HeaderBlock', () => ({
    HeaderBlock: ({ index, showRemoveButton }: any) => (
        <div data-testid={`header-block-${index}`}>{String(showRemoveButton)}</div>
    ),
}));
jest.mock('../blocks/TextBlock', () => ({
    TextBlock: ({ index, showRemoveButton }: any) => (
        <div data-testid={`text-block-${index}`}>{String(showRemoveButton)}</div>
    ),
}));
jest.mock('../blocks/ImageBlock', () => ({
    ImageBlock: ({ index, isUploading, onUpload }: any) => (
        <div data-testid={`image-block-${index}`}>
            <span data-testid={`image-uploading-${index}`}>{String(isUploading)}</span>
            <button onClick={() => onUpload(index, new File(['x'], 'a.png'), 'image')}>
                trigger-image-upload-{index}
            </button>
        </div>
    ),
}));
jest.mock('../blocks/VideoBlock', () => ({
    VideoBlock: ({ index, isUploading, onUpload }: any) => (
        <div data-testid={`video-block-${index}`}>
            <span data-testid={`video-uploading-${index}`}>{String(isUploading)}</span>
            <button onClick={() => onUpload(index, new File(['x'], 'a.mp4'), 'video')}>
                trigger-video-upload-{index}
            </button>
        </div>
    ),
}));

import { CreatePostBlocks } from '../CreatePostBlocks';

const blocks: ContentBlock[] = [
    { type: 'header', content: 'عنوان' },
    { type: 'text', content: 'متن' },
    { type: 'image', url: '' },
    { type: 'video', url: '' },
];

describe('CreatePostBlocks', () => {
    const onUpdateBlock = jest.fn();
    const onRemoveBlock = jest.fn();
    const onUploadStateChange = jest.fn();
    const onError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the correct block component for each block type', () => {
        render(
            <CreatePostBlocks
                blocks={blocks}
                uploading={{}}
                onUpdateBlock={onUpdateBlock}
                onRemoveBlock={onRemoveBlock}
                onUploadStateChange={onUploadStateChange}
                onError={onError}
            />
        );

        expect(screen.getByTestId('header-block-0')).toBeInTheDocument();
        expect(screen.getByTestId('text-block-1')).toBeInTheDocument();
        expect(screen.getByTestId('image-block-2')).toBeInTheDocument();
        expect(screen.getByTestId('video-block-3')).toBeInTheDocument();
    });

    it('passes showRemoveButton=false when there is only a single block', () => {
        render(
            <CreatePostBlocks
                blocks={[{ type: 'header', content: '' }]}
                uploading={{}}
                onUpdateBlock={onUpdateBlock}
                onRemoveBlock={onRemoveBlock}
                onUploadStateChange={onUploadStateChange}
                onError={onError}
            />
        );

        expect(screen.getByTestId('header-block-0')).toHaveTextContent('false');
    });

    it('passes showRemoveButton=true when there are multiple blocks', () => {
        render(
            <CreatePostBlocks
                blocks={blocks}
                uploading={{}}
                onUpdateBlock={onUpdateBlock}
                onRemoveBlock={onRemoveBlock}
                onUploadStateChange={onUploadStateChange}
                onError={onError}
            />
        );

        expect(screen.getByTestId('header-block-0')).toHaveTextContent('true');
    });

    it('passes the correct isUploading flag down to media blocks', () => {
        render(
            <CreatePostBlocks
                blocks={blocks}
                uploading={{ 2: true, 3: false }}
                onUpdateBlock={onUpdateBlock}
                onRemoveBlock={onRemoveBlock}
                onUploadStateChange={onUploadStateChange}
                onError={onError}
            />
        );

        expect(screen.getByTestId('image-uploading-2')).toHaveTextContent('true');
        expect(screen.getByTestId('video-uploading-3')).toHaveTextContent('false');
    });

    describe('handleFileUpload', () => {
        it('uploads successfully: sets loading true/false, updates block url, shows success toast', async () => {
            (uploadPostMedia as jest.Mock).mockResolvedValueOnce('https://cdn.example.com/a.png');

            render(
                <CreatePostBlocks
                    blocks={blocks}
                    uploading={{}}
                    onUpdateBlock={onUpdateBlock}
                    onRemoveBlock={onRemoveBlock}
                    onUploadStateChange={onUploadStateChange}
                    onError={onError}
                />
            );

            fireEvent.click(screen.getByText('trigger-image-upload-2'));

            expect(onUploadStateChange).toHaveBeenCalledWith(2, true);

            await waitFor(() => {
                expect(uploadPostMedia).toHaveBeenCalled();
                expect(onUpdateBlock).toHaveBeenCalledWith(2, 'url', 'https://cdn.example.com/a.png');
                expect(toast.success).toHaveBeenCalled();
                expect(onUploadStateChange).toHaveBeenCalledWith(2, false);
            });
        });

        it('handles upload failure: shows error toast and resets loading state', async () => {
            (uploadPostMedia as jest.Mock).mockRejectedValueOnce(new Error('حجم فایل زیاد است'));

            render(
                <CreatePostBlocks
                    blocks={blocks}
                    uploading={{}}
                    onUpdateBlock={onUpdateBlock}
                    onRemoveBlock={onRemoveBlock}
                    onUploadStateChange={onUploadStateChange}
                    onError={onError}
                />
            );

            fireEvent.click(screen.getByText('trigger-video-upload-3'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'حجم فایل زیاد است',
                    expect.any(Object)
                );
                expect(onUpdateBlock).not.toHaveBeenCalled();
                expect(onUploadStateChange).toHaveBeenLastCalledWith(3, false);
            });
        });
    });
});