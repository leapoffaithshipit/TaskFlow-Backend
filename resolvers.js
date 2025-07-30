const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('data.json');
const db = low(adapter);

// Initialize database
db.defaults({ users: [], Todos: [] }).write();

const JWT_SECRET = 'your-secret-key';

const getUser = (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    return db.get('users').find({ id: decoded.userId }).value();
  } catch {
    return null;
  }
};

const resolvers = {
  Query: {
    me: (_, __, { token }) => {
      const user = getUser(token);
      return user;
    },
    Todos: (_, __, { token }) => {
      const user = getUser(token);
      if (!user) throw new Error('Not authenticated');
      
      return db.get('Todos').filter({ userId: user.id }).value();
    },
  },

  Mutation: {
    signup: async (_, { email, password }) => {
      const existingUser = db.get('users').find({ email }).value();
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = {
        id: uuidv4(),
        email,
        password: hashedPassword,
      };

      db.get('users').push(user).write();

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = db.get('users').find({ email }).value();
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return { token, user };
    },

    createTodo: (_, { title }, { token }) => {
      const user = getUser(token);
      if (!user) throw new Error('Not authenticated');

      const Todo = {
        id: uuidv4(),
        title,
        completed: false,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      db.get('Todos').push(Todo).write();
      return Todo;
    },

    updateTodo: (_, { id, title, completed }, { token }) => {
      const user = getUser(token);
      if (!user) throw new Error('Not authenticated');

      const Todo = db.get('Todos').find({ id, userId: user.id });
      if (!Todo.value()) throw new Error('Todo not found');

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (completed !== undefined) updates.completed = completed;

      Todo.assign(updates).write();
      return Todo.value();
    },

    deleteTodo: (_, { id }, { token }) => {
      const user = getUser(token);
      if (!user) throw new Error('Not authenticated');

      const Todo = db.get('Todos').find({ id, userId: user.id }).value();
      if (!Todo) throw new Error('Todo not found');

      db.get('Todos').remove({ id, userId: user.id }).write();
      return true;
    },
  },

  User: {
    Todos: (user) => {
      return db.get('Todos').filter({ userId: user.id }).value();
    },
  },
};

module.exports = resolvers;