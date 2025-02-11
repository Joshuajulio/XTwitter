import { GraphQLScalarType, Kind } from "graphql";
import Post from "../models/Post.js";
import redis from "../config/redis.js";

const typeDefs = `#graphql
    scalar Date
    type Post {
        _id: ID!
        content: String!
        tags: [String]
        imgUrl: String
        authorId: ID!
        isLiked: Boolean
        commentsCount: Int
        likesCount: Int
        comments: [Comment]
        likes: [Like]
        createdAt: Date
        updatedAt: Date
        author: Author
    }
    type Comment {
        content: String!
        username: String!
        profileImg: String
        createdAt: Date
        updatedAt: Date
    }
    type Like {
        username: String!
        profileImg: String
        createdAt: Date
        updatedAt: Date
    }
    type Author{
      _id: ID!
      name: String
      username: String!
      profileImg: String
    }

    input CreatePostInput {
        content: String!
        tags: [String]
        imgUrl: String
    }
    input CommentInput {
        postId: String!
        content: String!
    }
    input LikeInput {
        postId: String!
    }

    type Query {
        posts: [Post]
        postById(_id: String): Post
    }

    type Mutation {
        createPost(payload: CreatePostInput): String
        createComment(payload: CommentInput): String
        likePost(payload: LikeInput): String
        unlikePost(payload: LikeInput): String
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
    posts: async function (_, __, contextValue) {
      const user = await contextValue.authN();
      const cachedPosts = await redis.get("posts");
      if (cachedPosts) return JSON.parse(cachedPosts);

      const posts = await Post.getPosts({ viewerUsername: user.username });
      await redis.set("posts", JSON.stringify(posts));
      return posts;
    },
    postById: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { _id } = args;
      const post = await Post.getPostById(_id, {
        viewerUsername: user.username,
      });
      return post;
    },
  },
  Mutation: {
    createPost: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { payload } = args;
      payload.authorId = user._id;
      const response = await Post.createPost(payload);
      await redis.del("posts");
      return response;
    },
    createComment: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { payload } = args;
      payload.username = user.username;
      const response = await Post.createComment(payload);
      await redis.del("posts");
      return response;
    },
    likePost: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { payload } = args;
      payload.username = user.username;
      const response = await Post.likePost(payload);
      await redis.del("posts");
      return response;
    },
    unlikePost: async function (_, args, contextValue) {
      const user = await contextValue.authN();
      const { payload } = args;
      payload.username = user.username;
      const response = await Post.unlikePost(payload);
      await redis.del("posts");
      return response;
    },
  },
};

export { typeDefs, resolvers };
