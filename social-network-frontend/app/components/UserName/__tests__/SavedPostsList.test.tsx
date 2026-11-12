// app/components/UserName/__tests__/SavedPostsList.test.tsx

import { SavedPostsList } from '../SavedPostsList';
import {
    render,
    screen
} from '@testing-library/react';

// ✅ mock Apollo
let mockQueryData: any = null;
let mockQueryLoading = false;

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(() => ({
        data: mockQueryData,
        loading: mockQueryLoading,
        error: null,
    })),
}));

// ✅ mock ProfilePostCard
jest.mock('../ProfilePostCard', () => ({
    ProfilePostCard: ({ post }: any) => (
        <div data-testid={`post-${post.id}`}>Post {post.id}</div>
    ),
}));

describe('SavedPostsList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockQueryData = null;
        mockQueryLoading = false;
    });

    it('shows loading spinner when loading', () => {
        mockQueryLoading = true;
        const { container } = render(<SavedPostsList />);
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows empty state when no posts', () => {
        mockQueryData = { getSavedPosts: { posts: [] } };
        render(<SavedPostsList />);
        
        expect(screen.getByText('هنوز پستی ذخیره نکرده‌اید')).toBeInTheDocument();
    });

    it('renders posts', () => {
        mockQueryData = {
            getSavedPosts: {
                posts: [
                    { id: '1', isSaved: true },
                    { id: '2', isSaved: true },
                ],
            },
        };
        render(<SavedPostsList />);

        expect(screen.getByTestId('post-1')).toBeInTheDocument();
        expect(screen.getByTestId('post-2')).toBeInTheDocument();
    });

    // ✅ مهم‌ترین تست: فیلتر شدن پست‌هایی که آنبوکمارک شدن
    it('filters out posts with isSaved: false (instant removal)', () => {
        mockQueryData = {
            getSavedPosts: {
                posts: [
                    { id: '1', isSaved: true },
                    { id: '2', isSaved: false }, // ✅ این نباید رندر بشه
                ],
            },
        };
        render(<SavedPostsList />);

        expect(screen.getByTestId('post-1')).toBeInTheDocument();
        expect(screen.queryByTestId('post-2')).not.toBeInTheDocument();
    });
});