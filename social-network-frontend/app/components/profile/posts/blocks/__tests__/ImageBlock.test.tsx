import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageBlock } from '../ImageBlock';
import { ContentBlock } from '../../types';

// ==========================================================
// Mock: next/image
// ==========================================================
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />;
    },
}));

// ==========================================================
// Mock: lucide-react
// ==========================================================
jest.mock('lucide-react', () => ({
    X: () => <svg data-testid="x-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
    Image: () => <svg data-testid="image-icon" />,
}));

const emptyImageBlock: ContentBlock = { type: 'image', url: '' };
const filledImageBlock: ContentBlock = { type: 'image', url: 'https://example.com/x.png', caption: 'توضیح' };
const videoBlock: ContentBlock = { type: 'video', url: 'x.mp4' };

describe('ImageBlock', () => {
    const onUpdate = jest.fn();
    const onRemove = jest.fn();
    const onUpload = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when block is not an image block', () => {
        const { container } = render(
            <ImageBlock
                block={videoBlock}
                index={0}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onUpload={onUpload}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    describe('when there is no url (upload state)', () => {
        it('shows the upload placeholder with the image icon', () => {
            render(
                <ImageBlock
                    block={emptyImageBlock}
                    index={0}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            expect(screen.getByTestId('image-icon')).toBeInTheDocument();
            expect(screen.getByText('کلیک کنید یا فایل را بکشید')).toBeInTheDocument();
        });

        it('shows the loading spinner when isUploading is true', () => {
            render(
                <ImageBlock
                    block={emptyImageBlock}
                    index={0}
                    isUploading={true}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
            expect(screen.queryByTestId('image-icon')).not.toBeInTheDocument();
        });

        it('calls onUpload with index, file and "image" type when a file is selected', () => {
            const { container } = render(
                <ImageBlock
                    block={emptyImageBlock}
                    index={4}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const file = new File(['content'], 'photo.png', { type: 'image/png' });
            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(fileInput, { target: { files: [file] } });

            expect(onUpload).toHaveBeenCalledWith(4, file, 'image');
        });

        it('does not call onUpload when no file is selected', () => {
            const { container } = render(
                <ImageBlock
                    block={emptyImageBlock}
                    index={0}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            fireEvent.change(fileInput, { target: { files: [] } });

            expect(onUpload).not.toHaveBeenCalled();
        });
    });

    describe('when a url exists (preview state)', () => {
        it('renders the image with the caption input filled', () => {
            render(
                <ImageBlock
                    block={filledImageBlock}
                    index={0}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            expect(screen.getByAltText('تصویر پست')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('توضیح تصویر (اختیاری)')).toHaveValue('توضیح');
        });

        it('falls back to empty caption when block.caption is undefined', () => {
            const blockNoCaption: ContentBlock = { type: 'image', url: 'x.png' };
            render(
                <ImageBlock
                    block={blockNoCaption}
                    index={0}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            expect(screen.getByPlaceholderText('توضیح تصویر (اختیاری)')).toHaveValue('');
        });

        it('calls onUpdate with the caption field when caption input changes', () => {
            render(
                <ImageBlock
                    block={filledImageBlock}
                    index={2}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const captionInput = screen.getByPlaceholderText('توضیح تصویر (اختیاری)');
            fireEvent.change(captionInput, { target: { value: 'توضیح جدید' } });

            expect(onUpdate).toHaveBeenCalledWith(2, 'caption', 'توضیح جدید');
        });

        it('clears the url when the clear (X) button on the image is clicked', () => {
            render(
                <ImageBlock
                    block={filledImageBlock}
                    index={3}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            // اولین دکمه X مربوط به پاک کردن URL تصویره
            const xButtons = screen.getAllByTestId('x-icon');
            fireEvent.click(xButtons[0].closest('button') as HTMLButtonElement);

            expect(onUpdate).toHaveBeenCalledWith(3, 'url', '');
        });
    });

    describe('remove button (removes whole block)', () => {
        it('is shown and calls onRemove with the correct index when showRemoveButton is true', () => {
            render(
                <ImageBlock
                    block={filledImageBlock}
                    index={7}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const xButtons = screen.getAllByTestId('x-icon');
            // دومین X مربوط به حذف کل بلاکه
            fireEvent.click(xButtons[1].closest('button') as HTMLButtonElement);

            expect(onRemove).toHaveBeenCalledWith(7);
        });

        it('is not rendered when showRemoveButton is false', () => {
            render(
                <ImageBlock
                    block={filledImageBlock}
                    index={0}
                    showRemoveButton={false}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            // فقط یک X باید باشه (مربوط به پاک کردن URL)
            expect(screen.getAllByTestId('x-icon')).toHaveLength(1);
        });
    });
});