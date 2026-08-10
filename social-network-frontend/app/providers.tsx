'use client';

import { store } from './redux/store';
import { Toaster } from 'react-hot-toast';
import { client } from './lib/apollo-client';
import { ApolloProvider } from '@apollo/client/react';
import { Provider as ReduxProvider } from 'react-redux';
import AuthChecker from './components/auth/AuthChecker';
import { ThemeInitializer } from './components/ThemeInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <AuthChecker />
        <ThemeInitializer />
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#22c55e',
                color: '#fff',
              },
              icon: '✅',
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              icon: '❌',
            },
          }}
        />
      </ApolloProvider>
    </ReduxProvider>
  );
}