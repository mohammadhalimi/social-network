import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextBlock } from '../TextBlock';
import { ContentBlock } from '../../types';

const textBlock: ContentBlock = { type: 'text', content: 'متن تست' };
const videoBlock: ContentBlock = { type: 'video', url: 'x.mp4' };

describe('TextBlock', () => {
    const onUpdate = jest.fn();
    const onRemove = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the textarea with block content', () => {
        render(
            <TextBlock
                block={textBlock}
                index={0}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        expect(screen.getByPlaceholderText('متن پست را بنویسید...')).toHaveValue('متن تست');
    });

    it('returns null when block is not a content block', () => {
        const { container } = render(
            <TextBlock
                block={videoBlock}
                index={0}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('calls onUpdate with index, field and new value when typing', () => {
        render(
            <TextBlock
                block={textBlock}
                index={1}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        const textarea = screen.getByPlaceholderText('متن پست را بنویسید...');
        fireEvent.change(textarea, { target: { value: 'متن جدید' } });

        expect(onUpdate).toHaveBeenCalledWith(1, 'content', 'متن جدید');
    });

    it('shows the remove button when showRemoveButton is true and calls onRemove with correct index', () => {
        const { container } = render(
            <TextBlock
                block={textBlock}
                index={5}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        const removeBtn = container.querySelector('button') as HTMLButtonElement;
        expect(removeBtn).toBeInTheDocument();

        fireEvent.click(removeBtn);
        expect(onRemove).toHaveBeenCalledWith(5);
    });

    it('hides the remove button when showRemoveButton is false', () => {
        const { container } = render(
            <TextBlock
                block={textBlock}
                index={0}
                showRemoveButton={false}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        expect(container.querySelector('button')).not.toBeInTheDocument();
    });
});