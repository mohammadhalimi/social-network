import themeReducer, {
    toggleTheme,
    setTheme,
    initTheme,
    Theme,
} from '../../../redux/features/themeSlice';

describe('themeSlice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (localStorage.getItem as jest.Mock).mockClear();
        (localStorage.setItem as jest.Mock).mockClear();
        (document.documentElement.setAttribute as jest.Mock).mockClear();
    });

    // ==========================================================
    //  تست ۱: حالت اولیه
    // ==========================================================
    it('should return the initial state', () => {
        const initialState = { theme: 'light' as Theme };
        expect(themeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    // ==========================================================
    //  تست ۲: toggleTheme از light به dark
    // ==========================================================
    it('should toggle theme from light to dark', () => {
        const initialState = { theme: 'light' as Theme };
        const newState = themeReducer(initialState, toggleTheme());

        expect(newState.theme).toBe('dark');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    // ==========================================================
    //  تست ۳: toggleTheme از dark به light
    // ==========================================================
    it('should toggle theme from dark to light', () => {
        const initialState = { theme: 'dark' as Theme };
        const newState = themeReducer(initialState, toggleTheme());

        expect(newState.theme).toBe('light');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    // ==========================================================
    //  تست ۴: setTheme به dark
    // ==========================================================
    it('should set theme to dark', () => {
        const initialState = { theme: 'light' as Theme };
        const newState = themeReducer(initialState, setTheme('dark'));

        expect(newState.theme).toBe('dark');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    // ==========================================================
    //  تست ۵: setTheme به light
    // ==========================================================
    it('should set theme to light', () => {
        const initialState = { theme: 'dark' as Theme };
        const newState = themeReducer(initialState, setTheme('light'));

        expect(newState.theme).toBe('light');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    // ==========================================================
    //  تست ۶: initTheme با تم ذخیره‌شده در localStorage
    // ==========================================================
    it('should init theme from localStorage', () => {
        (localStorage.getItem as jest.Mock).mockReturnValue('dark');

        const initialState = { theme: 'light' as Theme };
        const newState = themeReducer(initialState, initTheme());

        expect(newState.theme).toBe('dark');
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    // ==========================================================
    //  تست ۷: initTheme با تنظیمات سیستم (dark)
    // ==========================================================
    it('should init theme from system preference (dark)', () => {
        (localStorage.getItem as jest.Mock).mockReturnValue(null);

        (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));

        const initialState = { theme: 'light' as Theme };
        const newState = themeReducer(initialState, initTheme());

        expect(newState.theme).toBe('dark');
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    // ==========================================================
    //  تست ۸: initTheme با تنظیمات سیستم (light)
    // ==========================================================
    it('should init theme from system preference (light)', () => {
        (localStorage.getItem as jest.Mock).mockReturnValue(null);

        (window.matchMedia as jest.Mock).mockImplementation(() => ({
            matches: false,
            media: '',
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));

        const initialState = { theme: 'light' as Theme };
        const newState = themeReducer(initialState, initTheme());

        expect(newState.theme).toBe('light');
    });
});