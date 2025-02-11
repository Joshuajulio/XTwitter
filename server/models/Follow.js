import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";
import { signToken, verifyToken } from "../helpers/jwt.js";

class Follow {
  static getCollection() {
    const db = getDB();
    return db.collection("follows");
  }

  static async following(followingId, followerId) {
    const collection = this.getCollection();

    //check if already following
    const follow = await collection.findOne({
      followingId: new ObjectId(followingId),
      followerId: new ObjectId(followerId),
    });
    if (follow) throw new Error("Already following");

    await collection.insertOne({
      followingId: new ObjectId(followingId),
      followerId: new ObjectId(followerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return "You are now following this user";
  }

  static async unfollowing(followingId, followerId) {
    const collection = this.getCollection();

    //check if already following
    const follow = await collection.findOne({
      followingId: new ObjectId(followingId),
      followerId: new ObjectId(followerId),
    });
    if (!follow) throw new Error("Not following");

    await collection.deleteOne({
      followingId: new ObjectId(followingId),
      followerId: new ObjectId(followerId),
    });

    return "You have unfollowed this user";
  }
}

export default Follow;
