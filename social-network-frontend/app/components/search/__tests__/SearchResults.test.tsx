import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SearchResults } from '@/app/components/search/SearchResults';

const mockResults = [
  { id: '1', username: 'testuser', fullName: 'کاربر تست', bio: null, avatar: null },
];

const mockGetAvatarUrl = jest.fn();

describe('SearchResults', () => {
  it('should show loading state', () => {
    render(
      <SearchResults
        results={[]}
        loading={true}
        hasMore={false}
        isLoadingMore={false}
        searchTerm="test"
        onLoadMore={jest.fn()}
        onClose={jest.fn()}
        getAvatarUrl={mockGetAvatarUrl}
      />
    );
    expect(screen.getByTestId('search-loading')).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(
      <SearchResults
        results={[]}
        loading={false}
        hasMore={false}
        isLoadingMore={false}
        searchTerm="nonexistent"
        onLoadMore={jest.fn()}
        onClose={jest.fn()}
        getAvatarUrl={mockGetAvatarUrl}
      />
    );
    expect(screen.getByText('کاربری یافت نشد')).toBeInTheDocument();
  });

  it('should show results', () => {
    render(
      <SearchResults
        results={mockResults}
        loading={false}
        hasMore={false}
        isLoadingMore={false}
        searchTerm="test"
        onLoadMore={jest.fn()}
        onClose={jest.fn()}
        getAvatarUrl={mockGetAvatarUrl}
      />
    );
    expect(screen.getByText('کاربر تست')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });
});