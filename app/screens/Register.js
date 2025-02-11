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
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";

const REGISTER = gql`
  mutation Register($payload: UserInput) {
    register(payload: $payload)
  }
`;

export default function Register() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [input, setInput] = useState({
    name: "",
    username: "",
    profileImg: "",
    email: "",
    password: "",
  });

  function handleInputChange(name, value) {
    setInput({ ...input, [name]: value });
  }

  const [register, { data, loading, error }] = useMutation(REGISTER, {
    onCompleted: () => {
      alert("Register Success");
      navigation.navigate("Login");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleRegister = () => {
    register({ variables: { payload: input } });
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
        placeholder="Name"
        autoCapitalize="none"
        value={input.name}
        onChangeText={(value) => handleInputChange("name", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={input.username}
        onChangeText={(value) => handleInputChange("username", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Profile Image URL"
        autoCapitalize="none"
        value={input.profileImg}
        onChangeText={(value) => handleInputChange("profileImg", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={input.email}
        onChangeText={(value) => handleInputChange("email", value)}
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
          onChangeText={(value) => handleInputChange("password", value)}
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
        style={styles.createAccountButton}
        onPress={handleRegister}>
        <Text style={styles.createAccountButtonText}>Create account</Text>
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
        style={styles.loginButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.loginButtonText}>Log in</Text>
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
    margin: 20,
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
  createAccountButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#666",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  createAccountButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#000",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
