import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoBlock } from '../VideoBlock';
import { ContentBlock } from '../../types';

// ==========================================================
// Mock: lucide-react
// ==========================================================
jest.mock('lucide-react', () => ({
    X: () => <svg data-testid="x-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
    Video: () => <svg data-testid="video-icon" />,
}));

const emptyVideoBlock: ContentBlock = { type: 'video', url: '' };
const filledVideoBlock: ContentBlock = { type: 'video', url: 'https://example.com/x.mp4' };
const imageBlock: ContentBlock = { type: 'image', url: 'x.png' };

describe('VideoBlock', () => {
    const onUpdate = jest.fn();
    const onRemove = jest.fn();
    const onUpload = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when block is not a video block', () => {
        const { container } = render(
            <VideoBlock
                block={imageBlock}
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
        it('shows the upload placeholder with the video icon', () => {
            render(
                <VideoBlock
                    block={emptyVideoBlock}
                    index={0}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            expect(screen.getByTestId('video-icon')).toBeInTheDocument();
            expect(screen.getByText('کلیک کنید یا فایل را بکشید')).toBeInTheDocument();
        });

        it('shows the loading spinner when isUploading is true', () => {
            render(
                <VideoBlock
                    block={emptyVideoBlock}
                    index={0}
                    isUploading={true}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
            expect(screen.queryByTestId('video-icon')).not.toBeInTheDocument();
        });

        it('calls onUpload with index, file and "video" type when a file is selected', () => {
            const { container } = render(
                <VideoBlock
                    block={emptyVideoBlock}
                    index={6}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const file = new File(['content'], 'clip.mp4', { type: 'video/mp4' });
            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(fileInput, { target: { files: [file] } });

            expect(onUpload).toHaveBeenCalledWith(6, file, 'video');
        });

        it('does not call onUpload when no file is selected', () => {
            const { container } = render(
                <VideoBlock
                    block={emptyVideoBlock}
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
        it('renders the video tag with the correct src and controls', () => {
            const { container } = render(
                <VideoBlock
                    block={filledVideoBlock}
                    index={0}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const video = container.querySelector('video') as HTMLVideoElement;
            expect(video).toBeInTheDocument();
            expect(video).toHaveAttribute('src', filledVideoBlock.type === 'video' ? filledVideoBlock.url : '');
            expect(video).toHaveAttribute('controls');
        });

        it('clears the url when the clear (X) button on the video is clicked', () => {
            render(
                <VideoBlock
                    block={filledVideoBlock}
                    index={5}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const xButtons = screen.getAllByTestId('x-icon');
            fireEvent.click(xButtons[0].closest('button') as HTMLButtonElement);

            expect(onUpdate).toHaveBeenCalledWith(5, 'url', '');
        });
    });

    describe('remove button (removes whole block)', () => {
        it('is shown and calls onRemove with the correct index when showRemoveButton is true', () => {
            render(
                <VideoBlock
                    block={filledVideoBlock}
                    index={9}
                    showRemoveButton={true}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            const xButtons = screen.getAllByTestId('x-icon');
            fireEvent.click(xButtons[1].closest('button') as HTMLButtonElement);

            expect(onRemove).toHaveBeenCalledWith(9);
        });

        it('is not rendered when showRemoveButton is false', () => {
            render(
                <VideoBlock
                    block={filledVideoBlock}
                    index={0}
                    showRemoveButton={false}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onUpload={onUpload}
                />
            );

            expect(screen.getAllByTestId('x-icon')).toHaveLength(1);
        });
    });
});