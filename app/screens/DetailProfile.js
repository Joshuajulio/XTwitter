import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";

import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";

import { gql, useQuery, useMutation } from "@apollo/client";
import { AuthContext } from "../App";
import PostCard from "../components/PostCard";

const GET_USER_PROFILE = gql`
  query GetUserProfile($id: String) {
    getUserProfile(_id: $id) {
      _id
      name
      username
      profileImg
      isFollowed
      followersCount
      followingsCount
      posts {
        _id
        content
        tags
        imgUrl
        authorId
        commentsCount
        likesCount
        createdAt
        updatedAt
        isLiked
        author {
          _id
          name
          username
          profileImg
        }
      }
    }
  }
`;

const FOLLOWING = gql`
  mutation Mutation($followingId: ID) {
    following(followingId: $followingId)
  }
`;

const UNFOLLOWING = gql`
  mutation Mutation($followingId: ID) {
    unfollowing(followingId: $followingId)
  }
`;

export default function DetailProfile({ route }) {
  const navigation = useNavigation();
  const { userId } = route.params;
  const { loading, error, data } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
  });
  const [isFollowed, setIsFollowed] = useState(
    data?.getUserProfile?.isFollowed
  );
  const [following] = useMutation(FOLLOWING, {
    refetchQueries: [GET_USER_PROFILE],
    onCompleted: () => {
      setIsFollowed(true);
    },
  });
  const [unfollowing] = useMutation(UNFOLLOWING, {
    refetchQueries: [GET_USER_PROFILE],
    onCompleted: () => {
      setIsFollowed(false);
    },
  });

  const profile = data?.getUserProfile;
  useEffect(() => {
    if (data && data.getUserProfile) {
      setIsFollowed(data.getUserProfile.isFollowed || false);
    }
  }, [data]);

  const handleFollow = async () => {
    try {
      if (!isFollowed) {
        await following({
          variables: { followingId: profile._id },
        });
      } else {
        await unfollowing({
          variables: { followingId: profile._id },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{
              uri: profile?.profileImg || "https://picsum.photos/50/50",
            }}
            style={styles.profileAvatar}
          />
          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.profileUsername}>@{profile?.username}</Text>
          <View style={styles.stats}>
            <Pressable
              onPress={() =>
                navigation.navigate("Followings", { userId: profile?._id })
              }>
              <Text style={styles.statsText}>
                {profile?.followingsCount} Following
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                navigation.navigate("Followers", { userId: profile?._id })
              }>
              <Text style={styles.statsText}>
                {profile?.followersCount} Followers
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
            <Text style={styles.buttonText}>
              {isFollowed ? "Unfollow" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.posts}>
        <FlatList
          data={profile?.posts}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              profile={profile}
              previousScreen="DetailProfile"
            />
          )}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 180 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 75,
  },
  header: {
    padding: 20,
    backgroundColor: "#1DA1F2",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileInfo: {
    alignItems: "flex-start",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  profileUsername: {
    fontSize: 16,
    color: "#fff",
  },
  stats: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: "transparent",
  },
  statsText: {
    marginRight: 20,
    fontSize: 14,
    color: "#fff",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "top",
    justifyContent: "flex-end",
    height: 35,
  },
  followButton: {
    backgroundColor: "#fff",
    width: 100,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
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
