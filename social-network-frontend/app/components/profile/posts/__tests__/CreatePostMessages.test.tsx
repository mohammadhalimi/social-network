import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CreatePostMessages } from '../CreatePostMessages';

jest.mock('lucide-react', () => ({
    CheckCircle: () => <svg data-testid="check-icon" />,
}));

describe('CreatePostMessages', () => {
    it('renders the success message when showSuccess is true', () => {
        render(<CreatePostMessages showSuccess={true} errorMessage={null} />);

        expect(screen.getByText('پست شما با موفقیت منتشر شد! ✅')).toBeInTheDocument();
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('renders nothing when showSuccess is false', () => {
        const { container } = render(<CreatePostMessages showSuccess={false} errorMessage={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing even if errorMessage is set but showSuccess is false', () => {
        const { container } = render(
            <CreatePostMessages showSuccess={false} errorMessage="خطا رخ داد" />
        );
        expect(container).toBeEmptyDOMElement();
    });
});