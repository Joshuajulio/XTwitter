import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useEffect, useContext } from "react";

import { GET_MY_PROFILE } from "./MyProfile";
import { GET_POSTS } from "./Home";
import { AuthContext } from "../App";

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

export const GET_POST_BY_ID = gql`
  query PostById($id: String) {
    postById(_id: $id) {
      _id
      content
      tags
      imgUrl
      authorId
      commentsCount
      isLiked
      likesCount
      createdAt
      updatedAt
      comments {
        content
        username
        createdAt
        updatedAt
        profileImg
      }
      likes {
        username
        createdAt
        updatedAt
        profileImg
      }
      author {
        _id
        name
        username
        profileImg
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation Mutation($payload: CommentInput) {
    createComment(payload: $payload)
  }
`;

export default function DetailPost({ route }) {
  const navigation = useNavigation();
  const context = useContext(AuthContext);
  useContext(AuthContext);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { postId, previousScreen } = route.params;
  // console.log(previousScreen);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");

  const [createComment] = useMutation(CREATE_COMMENT, {
    refetchQueries: [
      { query: GET_POST_BY_ID, variables: { id: postId } },
      { query: GET_POSTS },
    ],
  });

  const [likePost] = useMutation(LIKE_POST, {
    refetchQueries: [
      { query: GET_POST_BY_ID, variables: { id: postId } },
      { query: GET_MY_PROFILE },
      { query: GET_POSTS },
    ],
    onCompleted: async () => {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    },
  });
  const [unlikePost] = useMutation(UNLIKE_POST, {
    refetchQueries: [
      { query: GET_POST_BY_ID, variables: { id: postId } },
      { query: GET_MY_PROFILE },
      { query: GET_POSTS },
    ],
    onCompleted: async () => {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    },
  });

  const { loading, error, data } = useQuery(GET_POST_BY_ID, {
    variables: { id: postId },
  });

  useEffect(() => {
    if (data && data.postById) {
      setIsLiked(data.postById.isLiked || false);
      setLikesCount(data.postById.likesCount || 0);
    }
  }, [data]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data || !data.postById) return <Text>No post found</Text>;

  const post = data.postById;

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
      } else {
        await likePost({
          variables: {
            payload: {
              postId: post._id,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCreateComment = async () => {
    try {
      if (!commentText.trim()) return;

      await createComment({
        variables: {
          payload: {
            postId: post._id,
            content: commentText.trim(),
          },
        },
      });
      setCommentText("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: previousScreen }] })
          }>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Post</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: post.author?.profileImg || "https://picsum.photos/50/50",
            }}
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{post.author?.name}</Text>
            <Text style={styles.username}>@{post.author?.username}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.tags}>
          {post.tags?.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>

        {post.imgUrl && (
          <Image source={{ uri: post.imgUrl }} style={styles.postImage} />
        )}

        <Text style={styles.date}>
          {new Date(post.createdAt).toLocaleString()}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="gray" />
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
            <Ionicons name="share-outline" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.commentsSection}>
          {post.comments?.map((comment, index) => (
            <View key={index}>
              <View style={styles.commentItem}>
                <Image
                  source={{
                    uri: comment.profileImg || "https://picsum.photos/50/50",
                  }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentName}>{comment.username}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
              <View style={styles.separator} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          multiline
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleCreateComment}>
          <Ionicons name="send" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 75,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 5,
  },
  userInfo: {
    flexDirection: "row",
    padding: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  nameContainer: {
    marginLeft: 10,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    color: "gray",
  },
  postContent: {
    fontSize: 16,
    padding: 15,
    paddingTop: 0,
    lineHeight: 22,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    padding: 15,
    paddingTop: 0,
  },
  tag: {
    color: "#1DA1F2",
    marginRight: 5,
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    paddingTop: 0,
  },
  date: {
    fontSize: 14,
    color: "gray",
    padding: 15,
    paddingTop: 0,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
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
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  commentsSection: {
    padding: 15,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentName: {
    fontWeight: "bold",
    marginRight: 5,
  },
  commentDate: {
    color: "gray",
    fontSize: 12,
  },
  commentText: {
    marginTop: 5,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    padding: 5,
  },
});
