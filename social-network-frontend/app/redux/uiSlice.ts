import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isMobileMenuOpen: boolean;
}

const initialState: UIState = {
    isMobileMenuOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setIsMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
            state.isMobileMenuOpen = action.payload;
        },
        toggleMobileMenu: (state) => {
            state.isMobileMenuOpen = !state.isMobileMenuOpen;
        },
    },
});

export const { setIsMobileMenuOpen, toggleMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;