import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";
import { useContext, useState, useCallback, useEffect, use } from "react";
import { AuthContext } from "../App";
import * as SecureStore from "expo-secure-store";
import { gql, useQuery } from "@apollo/client";
import PostCard from "../components/PostCard";
import Icon from "react-native-vector-icons/FontAwesome";

export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      _id
      name
      username
      profileImg
      followersCount
      followingsCount
      posts {
        _id
        content
        tags
        imgUrl
        authorId
        isLiked
        commentsCount
        likesCount
        createdAt
        updatedAt
        author {
          _id
          username
        }
      }
    }
  }
`;

export default function MyProfile() {
  const context = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("userId");
    context.setIsLoggedIn(false);
  };

  const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE, {
    fetchPolicy: "no-cache",
  });

  const profile = data?.getMyProfile;

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
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="sign-out" size={18} color="white" />
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
              previousScreen="MyProfileAndEdit"
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
  editButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: "center",
  },
  logoutButton: {
    backgroundColor: "#E0245E",
    padding: 8,
    borderRadius: 20,
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
