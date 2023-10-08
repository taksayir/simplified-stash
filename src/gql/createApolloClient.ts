import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const STASHDB_API = 'https://stashdb.org/graphql';

const httpLink = createHttpLink({
  uri: STASHDB_API,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      ApiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJkYjgzYjQ2OS01Y2U0LTRjYzItODBjOC02NjZmOWE5OGIyY2YiLCJzdWIiOiJBUElLZXkiLCJpYXQiOjE2NTUzODcwNzF9.zXFkKm0Y35Vaz3lI6yyP9qO67KofFoCgX4Kdm3hpBms"
    }
  }
});

function createApolloClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    ssrMode: typeof window === 'undefined',
    cache: new InMemoryCache(),
  });
}

export default createApolloClient;