import { GraphQLScalarType, Kind } from "graphql";
import User from "../models/User.js";
import redis from "../config/redis.js";

const typeDefs = `#graphql
    scalar Date
    type User {
        _id: ID!
        name: String
        profileImg: String
        username: String!
        email: String!
        password: String!
    }
    type LoginResponse {
        token: String
        userId: ID
    }
    type Profile {
        _id: ID
        name: String
        username: String
        profileImg: String
        email: String
        password: String
        createdAt: Date
        updatedAt: Date
        isFollowed: Boolean
        followersCount: Int
        followingsCount: Int
        followers: [Follower]
        followings: [Following]
        posts: [Post]
    }
    type Follower {
        followerId: ID
        name: String
        username: String
        profileImg: String
    }
    type Following {
        followingId: ID
        name: String
        username: String
        profileImg: String
    }
    type Post {
        _id: ID!
        content: String!
        tags: [String]
        imgUrl: String
        authorId: ID!
        commentsCount: Int
        likesCount: Int
        createdAt: Date
        updatedAt: Date
    }
    type Comment {
        content: String!
        username: String!
        createdAt: Date
        updatedAt: Date
    }
    type Like {
        username: String!
        createdAt: Date
        updatedAt: Date
    }

    input UserInput {
        name: String
        username: String!
        profileImg: String
        email: String!
        password: String!
    }

    input LoginInput {
        username: String
        password: String
    }

    type Query {
        users: [User]
        findByName(username: String): [User]
        findById(_id: String): User
        getUserProfile(_id: String): Profile
        getMyProfile: Profile
    }

    type Mutation {
        register(payload: UserInput): String
        login(payload: LoginInput): LoginResponse
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
  Query: {
    users: async function (_, __, contextValue) {
      await contextValue.authN();
      const users = await User.findAll();
      return users;
    },
    findByName: async function (_, args) {
      const { username } = args;
      const response = await User.findByName(username);
      return response;
    },
    findById: async function (_, args) {
      const { _id } = args;
      const response = await User.findById(_id);
      return response;
    },
    getUserProfile: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { _id } = args;
      const response = await User.getUserProfile(_id, user.username);
      return response;
    },
    getMyProfile: async function (_, __, contextValue) {
      const user = await contextValue.authN();
      const response = await User.getMyProfile(user._id, user.username);
      return response;
    },
  },
  Mutation: {
    register: async function (_, args) {
      const { payload } = args;
      const response = await User.register(payload);
      return response;
    },
    login: async function (_, args) {
      const { payload } = args;
      const response = await User.login(payload);
      await redis.del("posts");
      return response;
    },
  },
};

export { typeDefs, resolvers };
