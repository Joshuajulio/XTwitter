import {
  StyleSheet,
  Text,
  View,
  Button,
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
import * as SecureStore from "expo-secure-store";

const LOGIN = gql`
  mutation Login($payload: LoginInput) {
    login(payload: $payload) {
      token
      userId
    }
  }
`;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const context = useContext(AuthContext);
  const navigation = useNavigation();

  const [input, setInput] = useState({
    username: "JoshuaJulio",
    password: "joshua",
  });

  const handleInputChange = (name, value) => {
    setInput({ ...input, [name]: value });
  };

  const [login, { data, loading, error }] = useMutation(LOGIN, {
    onCompleted: async (data) => {
      //console.log(data.login.token);
      await SecureStore.setItemAsync("access_token", data.login.token);
      await SecureStore.setItemAsync("userId", data.login.userId);
      context.setIsLoggedIn(true);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleLogin = () => {
    login({ variables: { payload: input } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <Image source={require("../assets/X_logo.png")} style={styles.logo} />
      <Text style={styles.title}>
        See what's happening {"\n"} in the world right now.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Username / Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={input.username}
        onChangeText={(text) => handleInputChange("username", text)}
      />
      <View
        style={{
          width: "80%",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 15,
        }}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={input.password}
          onChangeText={(text) => handleInputChange("password", text)}
        />
        <TouchableOpacity
          style={{ position: "absolute", right: 15 }}
          onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={
              showPassword
                ? require("../assets/eye-open.jpg")
                : require("../assets/eye-close.jpg")
            }
            style={{ width: 18, height: 12 }}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => handleLogin()}>
        <Text style={styles.loginButtonText}>Log in</Text>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "80%",
          marginVertical: 10,
        }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#666" }} />
        <Text style={{ color: "#666", marginHorizontal: 10 }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#666" }} />
      </View>
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => navigation.navigate("Register")}>
        <Text style={styles.createAccountButtonText}>Create account</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 50, height: 50 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 30,
    textAlign: "center",
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  loginButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#666",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  createAccountButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#000",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  createAccountButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
