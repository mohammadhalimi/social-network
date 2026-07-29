import './env'; // 👈 اولین import
import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ruruHTML } from 'ruru/server';
import dotenv from 'dotenv';
import { userTypeDefs } from './graphql/schema/user.schema';
import { userResolvers } from './graphql/resolvers/user.resolver';

dotenv.config();

const app = express();
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
    _empty: () => '',
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(cors());
app.use(express.json());

app.use('/graphql', createHandler({ schema }));

app.get('/playground', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.get('/', (_req, res) => {
  res.redirect('/playground');
});

app.listen(PORT, () => {
  console.log(`🚀 سرور در حال اجراست:`);
  console.log(`📡 GraphQL API: http://localhost:${PORT}/graphql`);
  console.log(`🎨 محیط تست: http://localhost:${PORT}/playground`);
});