// frontend/src/graphql/client.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// HTTP-линк до твоего бэкенда
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Экспортируем готовый клиент
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
