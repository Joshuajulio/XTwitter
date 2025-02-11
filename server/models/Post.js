import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";
import User from "./User.js";

class Post {
  static getCollection() {
    const db = getDB();
    return db.collection("posts");
  }

  static async getPosts({ viewerUsername }) {
    const collection = this.getCollection();
    // console.log(viewerUsername);
    const posts = await collection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  profileImg: 1,
                },
              },
            ],
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
        {
          $addFields: {
            isLiked: {
              $cond: {
                if: { $isArray: "$likes" },
                then: {
                  $in: [viewerUsername, "$likes.username"],
                },
                else: false,
              },
            },
            likesCount: { $size: { $ifNull: ["$likes", []] } },
            commentsCount: { $size: { $ifNull: ["$comments", []] } },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();
    // console.dir(posts, { depth: null });
    return posts;
  }

  static async getPostById(id, { viewerUsername }) {
    const collection = this.getCollection();
    const [post] = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1, username: 1, profileImg: 1 } }],
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
        {
          $addFields: {
            isLiked: {
              $cond: {
                if: { $isArray: "$likes" },
                then: {
                  $in: [viewerUsername, "$likes.username"],
                },
                else: false,
              },
            },
            likesCount: { $size: { $ifNull: ["$likes", []] } },
            commentsCount: { $size: { $ifNull: ["$comments", []] } },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();
    if (!post) throw new Error("Post not found");
    // console.dir(post, { depth: null });
    return post;
  }
  static async createPost(payload) {
    const collection = this.getCollection();
    if (!payload.content) throw new Error("Content is required");
    if (!payload.authorId) throw new Error("Author ID is required");

    await collection.insertOne({
      ...payload,
      tags: payload.tags || [],
      imgUrl: payload.imgUrl || "",
      authorId: new ObjectId(payload.authorId),
      comments: [],
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return "Post created successfully";
  }

  static async createComment(payload) {
    const collection = this.getCollection();
    const { postId, content, username } = payload;
    if (!postId) throw new Error("Post ID is required");
    if (!content) throw new Error("Content is required");
    if (!username) throw new Error("Username is required");

    const post = await collection.findOne({ _id: new ObjectId(postId) });
    if (!post) throw new Error("Post not found");

    const [user] = await User.findByName(username);
    if (!user) throw new Error("User not found");

    await collection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $push: {
          comments: {
            content,
            username,
            profileImg: user.profileImg,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      }
    );

    return "Comment created successfully";
  }

  static async likePost(payload) {
    const collection = this.getCollection();
    const { postId, username } = payload;
    if (!postId) throw new Error("Post ID is required");
    if (!username) throw new Error("Username is required");

    const post = await collection.findOne({ _id: new ObjectId(postId) });
    if (!post) throw new Error("Post not found");

    const user = await User.findByName(username);
    if (!user) throw new Error("User not found");

    const like = post.likes.find((like) => like.username === username);
    if (like) throw new Error("Already liked");

    await collection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $push: {
          likes: {
            username,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      }
    );

    return `${username} liked this post`;
  }

  static async unlikePost(payload) {
    const collection = this.getCollection();
    const { postId, username } = payload;
    if (!postId) throw new Error("Post ID is required");
    if (!username) throw new Error("Username is required");

    const post = await collection.findOne({ _id: new ObjectId(postId) });
    if (!post) throw new Error("Post not found");

    const user = await User.findByName(username);
    if (!user) throw new Error("User not found");

    const like = post.likes.find((like) => like.username === username);
    if (!like) throw new Error("Has not been liked");

    await collection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $pull: {
          likes: {
            username,
          },
        },
      }
    );

    return `${username} unliked this post`;
  }
}

export default Post;
