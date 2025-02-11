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
import { useNavigation } from "@react-navigation/native";
import { useState, useContext } from "react";
import * as SecureStore from "expo-secure-store";

import { gql, useQuery, useMutation } from "@apollo/client";
import { AuthContext } from "../App";

const FIND_BY_USERNAME = gql`
  query FindByName($username: String) {
    findByName(username: $username) {
      _id
      name
      username
      profileImg
    }
  }
`;

export default function SearchPage() {
  const context = useContext(AuthContext);
  const currentUserId = SecureStore.getItem("userId");
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();

  const { loading, error, data } = useQuery(FIND_BY_USERNAME, {
    variables: { username: searchText },
  });

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        item._id === currentUserId
          ? navigation.navigate("MyProfile")
          : navigation.navigate("DetailProfile", { userId: item._id })
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

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#657786"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Twitter"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {searchText !== "" && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text>Error: {error.message}</Text>
        </View>
      ) : (
        <FlatList
          data={data?.findByName || []}
          renderItem={renderUserCard}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 75,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  cancelButton: {
    color: "black",
    fontSize: 16,
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
