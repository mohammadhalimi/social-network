import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderBlock } from '../HeaderBlock';
import { ContentBlock } from '../../types';

const headerBlock: ContentBlock = { type: 'header', content: 'عنوان تست' };
const imageBlock: ContentBlock = { type: 'image', url: 'x.png' };

describe('HeaderBlock', () => {
    const onUpdate = jest.fn();
    const onRemove = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the header input with block content', () => {
        render(
            <HeaderBlock
                block={headerBlock}
                index={0}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        expect(screen.getByPlaceholderText('عنوان پست را وارد کنید...')).toHaveValue('عنوان تست');
    });

    it('returns null when block is not a content block', () => {
        const { container } = render(
            <HeaderBlock
                block={imageBlock}
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
            <HeaderBlock
                block={headerBlock}
                index={2}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        const input = screen.getByPlaceholderText('عنوان پست را وارد کنید...');
        fireEvent.change(input, { target: { value: 'عنوان جدید' } });

        expect(onUpdate).toHaveBeenCalledWith(2, 'content', 'عنوان جدید');
    });

    it('shows the remove button when showRemoveButton is true', () => {
        const { container } = render(
            <HeaderBlock
                block={headerBlock}
                index={0}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('hides the remove button when showRemoveButton is false', () => {
        const { container } = render(
            <HeaderBlock
                block={headerBlock}
                index={0}
                showRemoveButton={false}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        expect(container.querySelector('button')).not.toBeInTheDocument();
    });

    it('calls onRemove with the correct index when remove button is clicked', () => {
        const { container } = render(
            <HeaderBlock
                block={headerBlock}
                index={3}
                showRemoveButton={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
            />
        );

        const removeBtn = container.querySelector('button') as HTMLButtonElement;
        fireEvent.click(removeBtn);

        expect(onRemove).toHaveBeenCalledWith(3);
    });
});