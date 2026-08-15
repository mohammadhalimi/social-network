import './env';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ruruHTML } from 'ruru/server';
import cookieParser from 'cookie-parser';
import uploadRoutes from './routes/upload.route';
import { userTypeDefs } from './graphql/schema/user.schema';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { userResolvers } from './graphql/resolvers/user.resolvers';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 4000;

// ترکیب TypeDefs
const typeDefs = `
  ${userTypeDefs}
  type Query {
    _empty: String
   
  }
`;

// ترکیب Resolverها به‌صورت درست (تو در تو، نه shallow spread)
const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-apollo-operation-name', 'apollo-require-preflight'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
// ✅ مسیر استاتیک برای دسترسی به عکس‌ها
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ مسیر آپلود عکس
app.use('/', uploadRoutes);

app.use('/graphql', (req, res, next) => {
  const token = req.cookies?.token || null;

  let user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        userId: string;
        email: string;
      };
      user = decoded;
    } catch (error) {
      console.log('❌ خطا در توکن:', error);
    }
  }

  const context = { req, res, user };

  return createHandler({ schema, context: () => context })(req, res, next);
});

app.get('/playground', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.get('/', (_req, res) => {
  res.redirect('/playground');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 سرور در حال اجراست:`);
    console.log(`📡 GraphQL API: http://localhost:${PORT}/graphql`);
    console.log(`🎨 محیط تست: http://localhost:${PORT}/playground`);
  });
}