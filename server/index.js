import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {
  typeDefs as userTypeDefs,
  resolvers as userResolvers,
} from "./schemas/userSchema.js";
import {
  typeDefs as postsTypeDefs,
  resolvers as postsResolvers,
} from "./schemas/postSchema.js";
import {
  typeDefs as followTypeDefs,
  resolvers as followResolvers,
} from "./schemas/followSchema.js";
import { verifyToken } from "./helpers/jwt.js";
import User from "./models/User.js";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const server = new ApolloServer({
  typeDefs: [userTypeDefs, postsTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postsResolvers, followResolvers],
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 3000 },
  context: async ({ req, res }) => {
    const authentication = async () => {
      const bearerToken = req.headers.authorization;
      if (!bearerToken) throw new Error("Invalid token");

      const token = bearerToken.split(" ")[1];
      if (!token) throw new Error("Invalid token");

      const { _id } = verifyToken(token);
      if (!_id) throw new Error("Invalid token");

      const user = await User.findById(_id);
      if (!user) throw new Error("Invalid token");

      const { password, ...rest } = user;
      return rest;
    };

    return {
      authN: () => authentication(),
    };
  },
});

console.log(`Server is running at ${url}`);
