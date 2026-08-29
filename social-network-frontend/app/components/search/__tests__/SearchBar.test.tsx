import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useLazyQuery } from '@apollo/client/react';
import { SearchBar } from '@/app/components/search/SearchBar';
import {
    render,
    screen,
    waitFor
} from '@testing-library/react';

// Mock useLazyQuery
jest.mock('@apollo/client/react', () => ({
    useLazyQuery: jest.fn(),
}));

const mockSearchUsers = jest.fn();
const mockFetchMore = jest.fn();

beforeEach(() => {
    (useLazyQuery as jest.Mock).mockReturnValue([
        mockSearchUsers,
        {
            loading: false,
            data: {
                searchUsers: {
                    users: [
                        { id: '1', username: 'testuser', fullName: 'کاربر تست', bio: null, avatar: null }
                    ],
                    hasMore: false,
                },
            },
            fetchMore: mockFetchMore,
        },
    ]);
});

describe('SearchBar', () => {
    it('should render search input', () => {
        render(<SearchBar />);
        expect(screen.getByPlaceholderText('جستجوی کاربران...')).toBeInTheDocument();
    });

    it('should search after typing 2+ characters (debounce)', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText('جستجوی کاربران...');
        await user.type(input, 'te');

        await waitFor(() => {
            expect(mockSearchUsers).toHaveBeenCalledWith({
                variables: { searchTerm: 'te', limit: 10, offset: 0 }
            });
        });
    });
});