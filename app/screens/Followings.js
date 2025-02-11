import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

import { gql, useQuery, useMutation } from "@apollo/client";
import { AuthContext } from "../App";

const GET_FOLLOWINGS = gql`
  query Followings($id: String) {
    getUserProfile(_id: $id) {
      followings {
        followingId
        name
        username
        profileImg
      }
    }
  }
`;

export default function Followings({ route }) {
  const context = useContext(AuthContext);
  const currentUserId = SecureStore.getItem("userId");

  const navigation = useNavigation();
  const { userId } = route.params;
  const { data, loading, error } = useQuery(GET_FOLLOWINGS, {
    variables: { id: userId },
  });

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        item.followingId === currentUserId
          ? navigation.navigate("MyProfile")
          : navigation.navigate("DetailProfile", { userId: item.followingId })
      }>
      <View style={styles.card}>
        <Image source={{ uri: item.profileImg }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Followings</Text>
      </View>
      <FlatList
        data={data?.getUserProfile?.followings}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.followingId}
      />
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 0.25,
    borderColor: "#E1E8ED",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    borderWidth: 0.25,
    borderColor: "#E1E8ED",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 10,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    color: "#657786",
  },
});
