import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import { AuthContext } from "../App";
import { gql, useMutation } from "@apollo/client";

import { GET_MY_PROFILE } from "./MyProfile";
import { GET_POSTS } from "./Home";

const CREATE_POST = gql`
  mutation CreatePost($payload: CreatePostInput) {
    createPost(payload: $payload)
  }
`;

export default function CreatePost() {
  const context = useContext(AuthContext);

  const [input, setInput] = useState({
    content: "",
    tags: "",
    imgUrl: "https://picsum.photos/id/39/367/267",
  });

  function handleInputChange(name, value) {
    setInput({ ...input, [name]: value });
  }

  const navigation = useNavigation();

  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_MY_PROFILE }, { query: GET_POSTS }],
    onCompleted: () => {
      alert("Post created successfully!");
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeAndCreatePost" }],
      });
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handlePost = () => {
    createPost({
      variables: {
        payload: {
          content: input.content,
          tags: input.tags.split(","),
          imgUrl: input.imgUrl,
        },
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Image source={require("../assets/X_logo.png")} style={styles.logo} />
        <TouchableOpacity onPress={handlePost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.contentInput}
          placeholder="What's happening?"
          multiline={true}
          value={input.content}
          onChangeText={(value) => handleInputChange("content", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Tags (comma separated)"
          value={input.tags}
          onChangeText={(value) => handleInputChange("tags", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={input.imgUrl}
          onChangeText={(value) => handleInputChange("imgUrl", value)}
        />
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  logo: {
    width: 28,
    height: 28,
  },
  postButton: {
    width: "auto",
    height: 30,
    backgroundColor: "#1DA1F2",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flex: 1,
    padding: 16,
  },
  contentInput: {
    height: 200,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
});
