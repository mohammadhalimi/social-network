// __tests__/SocketProvider.test.tsx
'use client';

import { renderHook } from '@testing-library/react';
import { render, screen, act } from '@testing-library/react';
import { SocketProvider, useSocket } from '../SocketProvider';

jest.mock('socket.io-client', () => ({
    io: jest.fn(),
}));

import { io } from 'socket.io-client';
const mockIo = io as jest.Mock;

const originalEnv = process.env;

beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = 'http://test-socket:4000';
});

afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
});

// ===================================================================
// useSocket
// ===================================================================
describe('useSocket', () => {
    it('returns default values outside provider', () => {
        const { result } = renderHook(() => useSocket());

        expect(result.current.socket).toBeNull();
        expect(result.current.isConnected).toBe(false);
    });
});

// ===================================================================
// SocketProvider
// ===================================================================
describe('SocketProvider', () => {
    let mockSocket: any;

    beforeEach(() => {
        mockSocket = {
            id: 'socket-123',
            on: jest.fn(),
            disconnect: jest.fn(),
        };
        mockIo.mockReturnValue(mockSocket);
    });

    const TestComponent = () => {
        const { isConnected, socket } = useSocket();
        return (
            <div>
                <span data-testid="connected">{isConnected ? 'yes' : 'no'}</span>
                <span data-testid="has-socket">{socket ? 'yes' : 'no'}</span>
            </div>
        );
    };

    it('creates socket on mount with env URL', () => {
        render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        expect(mockIo).toHaveBeenCalledTimes(1);
        expect(mockIo).toHaveBeenCalledWith(
            'http://test-socket:4000',
            expect.objectContaining({
                withCredentials: true,
                transports: ['websocket', 'polling'],
            })
        );
    });

    it('creates socket with custom URL prop', () => {
        render(
            <SocketProvider url="http://custom:5000">
                <TestComponent />
            </SocketProvider>
        );

        expect(mockIo).toHaveBeenCalledWith('http://custom:5000', expect.any(Object));
    });

    it('falls back to localhost when env not set', () => {
        delete process.env.NEXT_PUBLIC_API_URL;

        render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        expect(mockIo).toHaveBeenCalledWith('http://localhost:4000', expect.any(Object));
    });

    it('provides socket to context', () => {
        render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        expect(screen.getByTestId('has-socket')).toHaveTextContent('yes');
    });

    it('sets isConnected=true on connect event', () => {
        render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        const connectHandler = mockSocket.on.mock.calls.find(
            ([event]: [string]) => event === 'connect'
        )?.[1];

        act(() => {
            connectHandler();
        });

        expect(screen.getByTestId('connected')).toHaveTextContent('yes');
    });

    it('sets isConnected=false on disconnect event', () => {
        render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        const disconnectHandler = mockSocket.on.mock.calls.find(
            ([event]: [string]) => event === 'disconnect'
        )?.[1];

        act(() => {
            disconnectHandler('transport close');
        });

        expect(screen.getByTestId('connected')).toHaveTextContent('no');
    });

    it('sets isConnected=false on connect_error', () => {
        render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        const errorHandler = mockSocket.on.mock.calls.find(
            ([event]: [string]) => event === 'connect_error'
        )?.[1];

        act(() => {
            errorHandler(new Error('Connection failed'));
        });

        expect(screen.getByTestId('connected')).toHaveTextContent('no');
    });

    it('disconnects socket on unmount', () => {
        const { unmount } = render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        unmount();

        expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    });

    it('does not re-create socket on re-render', () => {
        const { rerender } = render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        rerender(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        expect(mockIo).toHaveBeenCalledTimes(1);
    });

    it('registers all required event handlers', () => {
        render(
            <SocketProvider>
                <TestComponent />
            </SocketProvider>
        );

        const events = mockSocket.on.mock.calls.map(([event]: [string]) => event);
        expect(events).toContain('connect');
        expect(events).toContain('disconnect');
        expect(events).toContain('connect_error');
    });
});