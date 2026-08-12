import authReducer, {
    authStart,
    loginSuccess,
    logout,
    authFailure,
    clearError,
    updateUser,
    User,
} from '../../../redux/features/authSlice';

describe('authSlice', () => {
    const mockUser: User = {
        id: 'cm123',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'کاربر تست',
        bio: 'این یک بیوگرافی تست است',
        avatar: 'https://cdn.example.com/avatar.png',
        createdAt: '2026-01-01T12:00:00.000Z',
        updatedAt: '2026-01-01T12:00:00.000Z',
    };

    const mockToken = 'fake-jwt-token';

    // ==========================================================
    //  تست ۱: حالت اولیه
    // ==========================================================
    it('should return the initial state', () => {
        const initialState = {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: true,
            error: null,
        };
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    // ==========================================================
    //  تست ۲: authStart
    // ==========================================================
    it('should handle authStart', () => {
        const initialState = {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: 'some error',
        };
        const newState = authReducer(initialState, authStart());
        expect(newState.loading).toBe(true);
        expect(newState.error).toBe(null);
    });

    // ==========================================================
    //  تست ۳: loginSuccess
    // ==========================================================
    it('should handle loginSuccess', () => {
        const initialState = {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: true,
            error: null,
        };
        const newState = authReducer(
            initialState,
            loginSuccess({ user: mockUser, token: mockToken })
        );

        expect(newState.user).toEqual(mockUser);
        expect(newState.token).toBe(mockToken);
        expect(newState.isAuthenticated).toBe(true);
        expect(newState.loading).toBe(false);
        expect(newState.error).toBe(null);
    });

    // ==========================================================
    //  تست ۴: logout
    // ==========================================================
    it('should handle logout', () => {
        const initialState = {
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            loading: false,
            error: null,
        };
        const newState = authReducer(initialState, logout());

        expect(newState.user).toBe(null);
        expect(newState.token).toBe(null);
        expect(newState.isAuthenticated).toBe(false);
        expect(newState.loading).toBe(false);
        expect(newState.error).toBe(null);
    });

    // ==========================================================
    //  تست ۵: authFailure
    // ==========================================================
    it('should handle authFailure', () => {
        const initialState = {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: true,
            error: null,
        };
        const errorMessage = 'خطا در احراز هویت';
        const newState = authReducer(initialState, authFailure(errorMessage));

        expect(newState.loading).toBe(false);
        expect(newState.error).toBe(errorMessage);
    });

    // ==========================================================
    //  تست ۶: clearError
    // ==========================================================
    it('should handle clearError', () => {
        const initialState = {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: 'some error',
        };
        const newState = authReducer(initialState, clearError());

        expect(newState.error).toBe(null);
    });

    // ==========================================================
    //  تست ۷: updateUser
    // ==========================================================
    it('should handle updateUser', () => {
        const initialState = {
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            loading: false,
            error: null,
        };
        const updatedUser = { ...mockUser, fullName: 'نام جدید' };
        const newState = authReducer(initialState, updateUser(updatedUser));

        expect(newState.user).toEqual(updatedUser);
        expect(newState.token).toBe(mockToken);
        expect(newState.isAuthenticated).toBe(true);
    });
});