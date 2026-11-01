import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Settings from '../index'; // یا هر مسیری که هست

// ✅ mock کامپوننت‌های فرزند
jest.mock('../PrivacyToggle', () => ({
    PrivacyToggle: () => <div data-testid="privacy-toggle" />,
}));

jest.mock('../ChangeTheme', () => ({
    ChangeTheme: () => <div data-testid="change-theme" />,
}));

describe('Settings', () => {
    it('renders the main settings layout', () => {
        render(<Settings />);

        expect(screen.getByTestId('settings-component')).toBeInTheDocument();
        expect(screen.getByText('⚙️ تنظیمات')).toBeInTheDocument();
        expect(screen.getByText('ظاهر و تنظیمات برنامه را مدیریت کنید')).toBeInTheDocument();
    });

    it('renders PrivacyToggle and ChangeTheme components', () => {
        render(<Settings />);

        expect(screen.getByTestId('privacy-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('change-theme')).toBeInTheDocument();
    });

    it('renders section headers', () => {
        render(<Settings />);

        expect(screen.getByText('حریم خصوصی')).toBeInTheDocument();
        expect(screen.getByText('ظاهر')).toBeInTheDocument();
    });
});