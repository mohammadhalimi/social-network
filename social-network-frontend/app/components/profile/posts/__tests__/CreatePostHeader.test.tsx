import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreatePostHeader } from '../CreatePostHeader';

jest.mock('lucide-react', () => ({
    Image: () => <svg data-testid="image-icon" />,
    Video: () => <svg data-testid="video-icon" />,
}));

describe('CreatePostHeader', () => {
    const onAddBlock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the title and all four add-block buttons', () => {
        render(<CreatePostHeader onAddBlock={onAddBlock} />);

        expect(screen.getByText('ایجاد پست جدید')).toBeInTheDocument();
        expect(screen.getByText('عنوان متن')).toBeInTheDocument();
        expect(screen.getByText('متن')).toBeInTheDocument();
        expect(screen.getByTestId('image-icon')).toBeInTheDocument();
        expect(screen.getByTestId('video-icon')).toBeInTheDocument();
    });

    it('calls onAddBlock with "header" when the header button is clicked', () => {
        render(<CreatePostHeader onAddBlock={onAddBlock} />);
        fireEvent.click(screen.getByTitle('افزودن عنوان'));
        expect(onAddBlock).toHaveBeenCalledWith('header');
    });

    it('calls onAddBlock with "text" when the text button is clicked', () => {
        render(<CreatePostHeader onAddBlock={onAddBlock} />);
        fireEvent.click(screen.getByTitle('افزودن متن'));
        expect(onAddBlock).toHaveBeenCalledWith('text');
    });

    it('calls onAddBlock with "image" when the image button is clicked', () => {
        render(<CreatePostHeader onAddBlock={onAddBlock} />);
        fireEvent.click(screen.getByTitle('افزودن تصویر'));
        expect(onAddBlock).toHaveBeenCalledWith('image');
    });

    it('calls onAddBlock with "video" when the video button is clicked', () => {
        render(<CreatePostHeader onAddBlock={onAddBlock} />);
        fireEvent.click(screen.getByTitle('افزودن ویدیو'));
        expect(onAddBlock).toHaveBeenCalledWith('video');
    });
});