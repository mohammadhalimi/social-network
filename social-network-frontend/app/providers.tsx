'use client';

import { ApolloProvider } from '@apollo/client/react';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from 'react-hot-toast'; // ✅ اضافه کردن
import { client } from './lib/apollo-client';
import { store } from './redux/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
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