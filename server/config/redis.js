import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// const redis = new Redis({
//   port: 6379,
//   host: "127.0.0.1",
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   db: 0,
// });

const redis = new Redis(process.env.REDIS_URI);

export default redis;
