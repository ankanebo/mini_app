// backend/src/index.ts
import { ApolloServer } from 'apollo-server';
import { createContext } from './context';
import { resolvers, typeDefs } from './schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 GraphQL сервер запущен по адресу ${url}`);
});
