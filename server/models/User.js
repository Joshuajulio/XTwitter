import { getDB } from "../config/mongodb.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.js";
import { signToken, verifyToken } from "../helpers/jwt.js";
import validator from "email-validator";
import { ObjectId } from "mongodb";

class User {
  static getCollection() {
    const db = getDB();
    return db.collection("users");
  }

  static async findAll() {
    const collection = this.getCollection();
    const users = await collection.find().toArray();
    return users;
  }

  static async register(payload) {
    const collection = this.getCollection();

    //validations
    if (!payload.username) throw new Error("Username is required");
    var user = await collection.findOne({ username: payload.username });
    if (user) throw new Error("Username already taken");

    if (!payload.email) throw new Error("Email is required");
    if (!validator.validate(payload.email))
      throw new Error("Invalid email format");
    var user = await collection.findOne({ email: payload.email });
    if (user) throw new Error("Email already taken");

    if (!payload.password) throw new Error("Password is required");
    if (payload.password.length < 5)
      throw new Error("Password is not strong enough");

    const hashedPassword = hashPassword(payload.password);
    await collection.insertOne({
      ...payload,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return `${payload.username} has been registered`;
  }

  static async login(payload) {
    const collection = this.getCollection();
    const { username, password } = payload;

    //validations
    if (!username) throw new Error("Username/Email is required");
    if (!password) throw new Error("Password is required");

    if (validator.validate(username)) {
      var user = await collection.findOne({
        email: username,
      });
    } else {
      var user = await collection.findOne({ username });
    }
    if (!user) throw new Error("Invalid username/email or password");
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid username/email or password");
    const token = signToken({ _id: user._id });

    return { token, userId: user._id };
  }

  static async findByName(username) {
    //find by name or username (find many which some part matched and case insensitive)

    const collection = this.getCollection();

    const users = await collection.find({
      $or: [
        { name: { $regex: username, $options: "i" } },
        { username: { $regex: username, $options: "i" } },
      ],
    });

    return users.toArray();
  }

  static async findById(id) {
    const collection = this.getCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) throw new Error("User not found");
    return user;
  }

  static async getUserProfile(id, viewerUsername) {
    const collection = this.getCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) throw new Error("User not found");

    const [profile] = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followingId",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "followerId",
                  foreignField: "_id",
                  as: "userDetails",
                },
              },
              {
                $unwind: "$userDetails",
              },
              {
                $project: {
                  followerId: 1,
                  name: "$userDetails.name",
                  username: "$userDetails.username",
                  profileImg: "$userDetails.profileImg",
                  _id: 0,
                },
              },
            ],
            as: "followers",
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followerId",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "followingId",
                  foreignField: "_id",
                  as: "userDetails",
                },
              },
              {
                $unwind: "$userDetails",
              },
              {
                $project: {
                  followingId: 1,
                  name: "$userDetails.name",
                  username: "$userDetails.username",
                  profileImg: "$userDetails.profileImg",
                  _id: 0,
                },
              },
            ],
            as: "followings",
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "authorId",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "authorId",
                  foreignField: "_id",
                  as: "authorDetails",
                },
              },
              {
                $unwind: "$authorDetails",
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
                },
              },
              {
                $project: {
                  _id: 1,
                  content: 1,
                  tags: 1,
                  imgUrl: 1,
                  authorId: 1,
                  author: {
                    _id: "$authorId",
                    username: "$authorDetails.username",
                    name: "$authorDetails.name",
                    profileImg: "$authorDetails.profileImg",
                  },
                  createdAt: 1,
                  updatedAt: 1,
                  isLiked: 1,
                  commentsCount: { $size: "$comments" },
                  likesCount: { $size: "$likes" },
                },
              },
              {
                $sort: { createdAt: -1 },
              },
            ],
            as: "posts",
          },
        },
        {
          $addFields: {
            followersCount: { $size: "$followers" },
            followingsCount: { $size: "$followings" },
            isFollowed: {
              $in: [viewerUsername, "$followers.username"],
            },
          },
        },
      ])
      .toArray();
    // console.dir(profile, { depth: null });
    return profile;
  }
  static async getMyProfile(id, viewerUsername) {
    const profile = await this.getUserProfile(id, viewerUsername);
    return profile;
  }
}

export default User;
