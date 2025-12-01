// frontend/App.tsx
import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { client } from './src/graphql/client';
import RootNavigator from './src/navigation/RootNavigator.tsx';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RootNavigator />
    </ApolloProvider>
  );
}
