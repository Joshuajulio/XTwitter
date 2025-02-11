import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { gql, useQuery } from "@apollo/client";
import PostCard from "../components/PostCard";
import { useContext } from "react";
import { AuthContext } from "../App";

export const GET_POSTS = gql`
  query Posts {
    posts {
      _id
      content
      tags
      imgUrl
      authorId
      commentsCount
      likesCount
      createdAt
      isLiked
      author {
        _id
        name
        username
        profileImg
      }
    }
  }
`;

export default function Home() {
  const context = useContext(AuthContext);

  const navigation = useNavigation();
  const { loading, error, data } = useQuery(GET_POSTS, {
    fetchPolicy: "no-cache",
  });
  const posts = data?.posts;
  //   console.log(posts);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts || []}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            profile={item.author}
            previousScreen="HomeAndCreatePost"
          />
        )}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("CreatePost")}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 75,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1DA1F2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
