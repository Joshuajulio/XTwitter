import { GraphQLScalarType, Kind } from "graphql";
import Follow from "../models/Follow.js";

const typeDefs = `#graphql
    scalar Date
    type Follow {
        _id: ID
        followingId: ID
        followerId: ID
        createdAt: Date
        updatedAt: Date
    }

    type Query {
        follows: [Follow]
    }

    type Mutation {
        following(followingId: ID): String
        unfollowing(followingId: ID): String
    }
`;

const resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value) {
      if (typeof value === "string") {
        return value;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return null;
    },
    parseValue(value) {
      if (typeof value === "string") {
        return new Date(value);
      }
      return null;
    },
    parseLiteral(ast) {
      if (ast.kind === "StringValue") {
        return new Date(ast.value);
      }
      return null;
    },
  }),
  Query: {},
  Mutation: {
    following: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { _id: followerId } = user;
      const { followingId } = args;
      const response = await Follow.following(followingId, followerId);
      return response;
    },
    unfollowing: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { _id: followerId } = user;
      const { followingId } = args;
      const response = await Follow.unfollowing(followingId, followerId);
      return response;
    },
  },
};

export { typeDefs, resolvers };
