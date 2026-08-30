import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreatePostActions } from '../CreatePostActions';

jest.mock('lucide-react', () => ({
    Loader2: () => <svg data-testid="loader-icon" />,
}));

describe('CreatePostActions', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders block and content counts', () => {
        render(
            <CreatePostActions
                blocksCount={3}
                contentCount={2}
                isSubmitting={false}
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        );

        expect(screen.getByText('3 بلوک · 2 محتوا')).toBeInTheDocument();
    });

    it('shows "انتشار پست" and enabled submit button when not submitting', () => {
        render(
            <CreatePostActions
                blocksCount={2}
                contentCount={2}
                isSubmitting={false}
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        );

        const submitBtn = screen.getByText('انتشار پست');
        expect(submitBtn).toBeInTheDocument();
        expect(submitBtn.closest('button')).not.toBeDisabled();
        expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
    });

    it('shows loading state and disables submit button when isSubmitting is true', () => {
        render(
            <CreatePostActions
                blocksCount={2}
                contentCount={2}
                isSubmitting={true}
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        );

        expect(screen.getByText('در حال ارسال...')).toBeInTheDocument();
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
        expect(screen.getByText('در حال ارسال...').closest('button')).toBeDisabled();
    });

    it('calls onSubmit when the submit button is clicked', () => {
        render(
            <CreatePostActions
                blocksCount={2}
                contentCount={2}
                isSubmitting={false}
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        );

        fireEvent.click(screen.getByText('انتشار پست'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    describe('cancel flow', () => {
        it('calls onCancel directly when contentCount is 0 (no confirm dialog)', () => {
            render(
                <CreatePostActions
                    blocksCount={2}
                    contentCount={0}
                    isSubmitting={false}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            );

            fireEvent.click(screen.getByText('انصراف'));

            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(screen.queryByText('آیا مطمئن هستید؟')).not.toBeInTheDocument();
        });

        it('shows the confirm dialog instead of calling onCancel when contentCount > 0', () => {
            render(
                <CreatePostActions
                    blocksCount={2}
                    contentCount={2}
                    isSubmitting={false}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            );

            fireEvent.click(screen.getByText('انصراف'));

            expect(onCancel).not.toHaveBeenCalled();
            expect(screen.getByText('آیا مطمئن هستید؟')).toBeInTheDocument();
            expect(
                screen.getByText('با انصراف، تمام محتوای نوشته شده از بین خواهد رفت.')
            ).toBeInTheDocument();
        });

        it('closes the confirm dialog without calling onCancel when "ادامه ویرایش" is clicked', () => {
            render(
                <CreatePostActions
                    blocksCount={2}
                    contentCount={2}
                    isSubmitting={false}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            );

            fireEvent.click(screen.getByText('انصراف'));
            expect(screen.getByText('آیا مطمئن هستید؟')).toBeInTheDocument();

            fireEvent.click(screen.getByText('ادامه ویرایش'));

            expect(onCancel).not.toHaveBeenCalled();
            expect(screen.queryByText('آیا مطمئن هستید؟')).not.toBeInTheDocument();
        });

        it('calls onCancel and closes the dialog when "انصراف از پست" is confirmed', () => {
            render(
                <CreatePostActions
                    blocksCount={2}
                    contentCount={2}
                    isSubmitting={false}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            );

            fireEvent.click(screen.getByText('انصراف'));
            fireEvent.click(screen.getByText('انصراف از پست'));

            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(screen.queryByText('آیا مطمئن هستید؟')).not.toBeInTheDocument();
        });
    });
});