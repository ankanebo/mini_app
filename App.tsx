// App.tsx (в корне MyNewApp)
import { ApolloProvider } from '@apollo/client';
import React from 'react';

import { client } from './frontend/src/graphql/client';
import RootNavigator from './frontend/src/navigation/RootNavigator';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RootNavigator />
    </ApolloProvider>
  );
}
