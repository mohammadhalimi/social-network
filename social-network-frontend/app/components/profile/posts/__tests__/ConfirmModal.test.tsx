// components/common/__tests__/ConfirmModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmModal } from '../ConfirmModal';

// ماک کردن lucide-react برای جلوگیری از خطای SVG در jsdom
jest.mock('lucide-react', () => ({
    AlertTriangle: () => <svg data-testid="alert-icon" />,
}));

describe('ConfirmModal', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    const baseProps = {
        isOpen: true,
        title: 'حذف پست',
        message: 'آیا از حذف این پست مطمئن هستید؟',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('1. وقتی isOpen برابر false است، چیزی رندر نمی‌شود', () => {
        render(
            <ConfirmModal
                {...baseProps}
                isOpen={false}
            />
        );

        expect(screen.queryByText('حذف پست')).not.toBeInTheDocument();
    });

    it('2. وقتی isOpen برابر true است، عنوان، پیام و دکمه‌ها نمایش داده می‌شوند', () => {
        render(<ConfirmModal {...baseProps} />);

        expect(screen.getByText('حذف پست')).toBeInTheDocument();
        expect(screen.getByText('آیا از حذف این پست مطمئن هستید؟')).toBeInTheDocument();
        
        // دکمه‌های پیش‌فرض
        expect(screen.getByRole('button', { name: /حذف/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /انصراف/i })).toBeInTheDocument();
        
        // آیکون هشدار
        expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('3. با کلیک روی دکمه تایید، onConfirm صدا زده می‌شود', () => {
        render(<ConfirmModal {...baseProps} />);

        fireEvent.click(screen.getByRole('button', { name: /حذف/i }));

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('4. با کلیک روی دکمه انصراف، onCancel صدا زده می‌شود', () => {
        render(<ConfirmModal {...baseProps} />);

        fireEvent.click(screen.getByRole('button', { name: /انصراف/i }));

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('5. متن دکمه‌های سفارشی (Custom Labels) را نمایش می‌دهد', () => {
        render(
            <ConfirmModal
                {...baseProps}
                confirmText="بله، حذف کن"
                cancelText="نه، برگرد"
            />
        );

        expect(screen.getByRole('button', { name: /بله، حذف کن/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /نه، برگرد/i })).toBeInTheDocument();
    });
});