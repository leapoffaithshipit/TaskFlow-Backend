# Todo Backend

This is the backend service for the Todo application, built with Apollo Server and GraphQL.

## Features

- GraphQL API for Todo management
- In-memory database using lowdb
- CRUD operations for Todos
- Real-time updates with GraphQL subscriptions

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The GraphQL Playground will be available at `http://localhost:4000`

## API Documentation

### Queries
- `Todos`: Get all Todos
- `Todo(id: ID!)`: Get a single Todo by ID

### Mutations
- `createTodo(title: String!)`: Create a new Todo
- `updateTodo(id: ID!, title: String, completed: Boolean)`: Update a Todo
- `deleteTodo(id: ID!)`: Delete a Todo
