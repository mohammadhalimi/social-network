// src/app/redux/features/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isMobileMenuOpen: boolean;
    postModalId: string | null;  // ✅ جدید
}

const initialState: UIState = {
    isMobileMenuOpen: false,
    postModalId: null,  // ✅ جدید
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
        // ✅ جدید: باز کردن مودال پست
        openPostModal: (state, action: PayloadAction<string>) => {
            state.postModalId = action.payload;
        },
        // ✅ جدید: بستن مودال پست
        closePostModal: (state) => {
            state.postModalId = null;
        },
    },
});

export const {
    setIsMobileMenuOpen,
    toggleMobileMenu,
    openPostModal,   // ✅ جدید
    closePostModal,  // ✅ جدید
} = uiSlice.actions;

export default uiSlice.reducer;