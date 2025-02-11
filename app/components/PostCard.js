import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";

import { gql, useMutation } from "@apollo/client";
import { GET_MY_PROFILE } from "../screens/MyProfile";
import { GET_POSTS } from "../screens/Home";

const LIKE_POST = gql`
  mutation LikePost($payload: LikeInput) {
    likePost(payload: $payload)
  }
`;
const UNLIKE_POST = gql`
  mutation UnlikePost($payload: LikeInput) {
    unlikePost(payload: $payload)
  }
`;

export default function PostCard({ post, profile, previousScreen }) {
  const navigation = useNavigation();
  const currentUserId = SecureStore.getItem("userId");
  const [isBookmarked, setIsBookmarked] = useState(false);
  //   console.log(post);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const [likePost] = useMutation(LIKE_POST, {
    refetchQueries: [{ query: GET_MY_PROFILE }, { query: GET_POSTS }],
  });
  const [unlikePost] = useMutation(UNLIKE_POST, {
    refetchQueries: [{ query: GET_MY_PROFILE }, { query: GET_POSTS }],
  });

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost({
          variables: {
            payload: {
              postId: post._id,
            },
          },
        });
        setLikesCount((prev) => prev - 1);
      } else {
        await likePost({
          variables: {
            payload: {
              postId: post._id,
            },
          },
        });
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("DetailPost", { postId: post._id, previousScreen })
      }>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() =>
          navigation.navigate("DetailPost", {
            postId: post._id,
            previousScreen,
          })
        }>
        <Pressable
          onPress={() =>
            profile._id === currentUserId
              ? navigation.navigate("MyProfile")
              : navigation.navigate("DetailProfile", { userId: profile._id })
          }>
          <Image
            source={{
              uri: profile.profileImg || "https://picsum.photos/50/50",
            }}
            style={styles.avatar}
          />
        </Pressable>
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <View style={styles.headerText}>
          <Text>
            <Text style={styles.authorName}>{profile.name} </Text>{" "}
            <Text style={styles.username}>@{post.author.username}</Text>
            {" •"}
            <Text style={styles.date}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </Text>
        </View>
        <Text style={styles.content}>{post.content}</Text>
        <View style={styles.tags}>
          {post.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
        {post.imgUrl && (
          <Image source={{ uri: post.imgUrl }} style={styles.postImage} />
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("DetailPost", { postId: post._id })
            }>
            <Ionicons name="chatbubble-outline" size={20} color="#536471" />
            <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#FF0000" : "#536471"}
            />
            <Text style={styles.actionText}>{likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsBookmarked(!isBookmarked)}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? "#1DA1F2" : "#536471"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#536471" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    flexDirection: "row",
  },
  avatarContainer: {
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  headerText: {
    marginBottom: 5,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#536471",
  },
  content: {
    fontSize: 16,
    marginTop: 5,
    lineHeight: 22,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tag: {
    color: "#1DA1F2",
    marginRight: 5,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginTop: 10,
  },
  date: {
    fontSize: 14,
    color: "#536471",
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingRight: 40,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    color: "#536471",
  },
});
