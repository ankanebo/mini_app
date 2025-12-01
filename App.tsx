import React from 'react';
// ⬇️ ВАЖНО: меняем путь
import { ApolloProvider } from '@apollo/client/react';

import { client } from './frontend/src/graphql/client';
import RootNavigator from './frontend/src/navigation/RootNavigator';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RootNavigator />
    </ApolloProvider>
  );
}
