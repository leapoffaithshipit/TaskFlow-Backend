const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();

  // Enable CORS 
app.use(cors({
  origin: '*', 
}));

  // Apollo Server setup with bounded cache
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    cache: 'bounded', // Fixes unbounded cache warning
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    },
  });

  // Start Apollo Server
  await server.start();
  server.applyMiddleware({ app });

  // Use Railway's dynamic port or fallback to 4000
  const PORT = process.env.PORT || 4000;

  // Start Express
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL server is running at:`);
    console.log(`🌐 http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📡 On Railway: https://<your-railway-subdomain>.up.railway.app${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
});
