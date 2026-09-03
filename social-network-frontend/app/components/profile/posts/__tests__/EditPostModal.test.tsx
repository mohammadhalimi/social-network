import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { EditPostModal } from '../EditPostModal';
import { useMutation } from '@apollo/client/react';
import { useEditPostBlocks } from '../EditPostModal/useEditPostBlocks';
import {
    render,
    screen,
    fireEvent,
    waitFor
} from '@testing-library/react';

jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

jest.mock('../EditPostModal/useEditPostBlocks', () => ({
    useEditPostBlocks: jest.fn(),
}));

jest.mock('../EditPostModal/BlockTypeButtons', () => ({
    BlockTypeButtons: ({ onAdd }: any) => (
        <button onClick={() => onAdd('text')}>Add Block</button>
    ),
}));

jest.mock('../EditPostModal/HeaderBlock', () => ({
    HeaderBlock: ({ onRemove }: any) => (
        <div>
            Header Block
            <button onClick={onRemove}>Remove Header</button>
        </div>
    ),
}));

jest.mock('../EditPostModal/TextBlock', () => ({
    TextBlock: ({ onRemove }: any) => (
        <div>
            Text Block
            <button onClick={onRemove}>Remove Text</button>
        </div>
    ),
}));

jest.mock('../EditPostModal/ImageBlock', () => ({
    ImageBlock: ({ onRemoveBlock }: any) => (
        <div>
            Image Block
            <button onClick={onRemoveBlock}>Remove Image</button>
        </div>
    ),
}));

jest.mock('../EditPostModal/VideoBlock', () => ({
    VideoBlock: ({ onRemoveBlock }: any) => (
        <div>
            Video Block
            <button onClick={onRemoveBlock}>Remove Video</button>
        </div>
    ),
}));

describe('EditPostModal', () => {
    const mockClose = jest.fn();
    const mockSuccess = jest.fn();
    const mockUpdatePost = jest.fn();

    const post = {
        id: '1',
        content: '{}',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useMutation as jest.Mock).mockReturnValue([mockUpdatePost]);

        (useEditPostBlocks as jest.Mock).mockReturnValue({
            blocks: [
                {
                    type: 'text',
                    content: 'hello',
                },
            ],
            uploading: {},
            isUploadingMedia: false,
            addBlock: jest.fn(),
            removeBlock: jest.fn(),
            updateBlock: jest.fn(),
            handleFileUpload: jest.fn(),
            validate: jest.fn(() => true),
        });
    });

    it('should not render when modal is closed', () => {
        render(
            <EditPostModal
                post={post}
                isOpen={false}
                onClose={mockClose}
            />
        );

        expect(
            screen.queryByText('ویرایش پست')
        ).not.toBeInTheDocument();
    });

    it('should render modal when open', () => {
        render(
            <EditPostModal
                post={post}
                isOpen
                onClose={mockClose}
            />
        );

        expect(
            screen.getByRole('heading', {
                name: 'ویرایش پست',
            })
        ).toBeInTheDocument();
        expect(screen.getByText('Text Block')).toBeInTheDocument();
    });

    it('should call onClose when cancel clicked', () => {
        render(
            <EditPostModal
                post={post}
                isOpen
                onClose={mockClose}
            />
        );

        fireEvent.click(screen.getByText('انصراف'));

        expect(mockClose).toHaveBeenCalled();
    });

    it('should not submit if validation fails', () => {
        (useEditPostBlocks as jest.Mock).mockReturnValue({
            blocks: [],
            uploading: {},
            isUploadingMedia: false,
            addBlock: jest.fn(),
            removeBlock: jest.fn(),
            updateBlock: jest.fn(),
            handleFileUpload: jest.fn(),
            validate: jest.fn(() => false),
        });

        render(
            <EditPostModal
                post={post}
                isOpen
                onClose={mockClose}
            />
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: 'ویرایش پست',
            })
        );

        expect(mockUpdatePost).not.toHaveBeenCalled();
    });

    it('should submit edited post', async () => {
        mockUpdatePost.mockResolvedValue({});

        render(
            <EditPostModal
                post={post}
                isOpen
                onClose={mockClose}
            />
        );

        // ✅ اضافه کردن کلیک روی دکمه
        fireEvent.click(
            screen.getByRole('button', {
                name: 'ویرایش پست',
            })
        );

        await waitFor(() => {
            expect(mockUpdatePost).toHaveBeenCalledWith({
                variables: {
                    postId: '1',
                    content: JSON.stringify({
                        blocks: [
                            {
                                type: 'text',
                                content: 'hello',
                            },
                        ],
                    }),
                },
            });
        });
    });

    it('should call mutation onCompleted', async () => {
        const options: any = {};

        (useMutation as jest.Mock).mockImplementation((_, opts) => {
            Object.assign(options, opts);

            return [
                jest.fn(async () => {
                    await options.onCompleted({
                        updatePost: {
                            post: {
                                id: '1',
                            },
                        },
                    });
                }),
            ];
        });

        render(
            <EditPostModal
                post={post}
                isOpen
                onClose={mockClose}
                onSuccess={mockSuccess}
            />
        );

        // ✅ اضافه کردن کلیک روی دکمه
        fireEvent.click(
            screen.getByRole('button', {
                name: 'ویرایش پست',
            })
        );

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled();
            expect(mockSuccess).toHaveBeenCalledWith({
                id: '1',
            });
            expect(mockClose).toHaveBeenCalled();
        });
    });

    it('should show error toast on mutation error', async () => {
        const options: any = {};

        (useMutation as jest.Mock).mockImplementation((_, opts) => {
            Object.assign(options, opts);

            return [
                jest.fn(async () => {
                    await options.onError({
                        message: 'Mutation failed',
                    });
                }),
            ];
        });

        render(
            <EditPostModal
                post={post}
                isOpen
                onClose={mockClose}
            />
        );

        // ✅ استفاده از getByRole به جای getByText
        fireEvent.click(
            screen.getByRole('button', {
                name: 'ویرایش پست',
            })
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Mutation failed'
            );
        });
    });

    it('should disable submit button while media is uploading', () => {
        (useEditPostBlocks as jest.Mock).mockReturnValue({
            blocks: [
                {
                    type: 'text',
                    content: 'hello',
                },
            ],
            uploading: {},
            isUploadingMedia: true,
            addBlock: jest.fn(),
            removeBlock: jest.fn(),
            updateBlock: jest.fn(),
            handleFileUpload: jest.fn(),
            validate: jest.fn(() => true),
        });

        render(
            <EditPostModal
                post={post}
                isOpen
                onClose={mockClose}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'ویرایش پست',
            })
        ).toBeDisabled();
    });
});