import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";

import "./global.css";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Home from "./screens/Home";
import SearchPage from "./screens/SearchPage";
import MyProfile from "./screens/MyProfile";
import DetailProfile from "./screens/DetailProfile";
import DetailPost from "./screens/DetailPost";
import CreatePost from "./screens/CreatePost";
import Followings from "./screens/Followings";
import Followers from "./screens/Followers";

import { ApolloProvider } from "@apollo/client";
import client from "./config/apollo";
import { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const showHeader = false;

export const AuthContext = createContext();

function HomeAndCreatePost() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: showHeader }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="DetailProfile" component={DetailProfile} />
      <Stack.Screen name="DetailPost" component={DetailPost} />
      <Stack.Screen name="Followings" component={Followings} />
      <Stack.Screen name="Followers" component={Followers} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
    </Stack.Navigator>
  );
}

function SearchAndUserProfile() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: showHeader }}>
      <Stack.Screen name="SearchPage" component={SearchPage} />
      <Stack.Screen name="DetailProfile" component={DetailProfile} />
      <Stack.Screen name="DetailPost" component={DetailPost} />
      <Stack.Screen name="Followings" component={Followings} />
      <Stack.Screen name="Followers" component={Followers} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
    </Stack.Navigator>
  );
}

function MyProfileAndEdit() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: showHeader }}>
      <Stack.Screen name="MyProfile" component={MyProfile} />
      <Stack.Screen name="DetailPost" component={DetailPost} />
      <Stack.Screen name="Followings" component={Followings} />
      <Stack.Screen name="Followers" component={Followers} />
      <Stack.Screen name="DetailProfile" component={DetailProfile} />
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: showHeader }}>
      <Tab.Screen
        name="HomeAndCreatePost"
        component={HomeAndCreatePost}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused, size }) => (
            <Icon name="home" size={size} color={focused ? "black" : "grey"} />
          ),
        }}
      />
      <Tab.Screen
        name="SearchAndUserProfile"
        component={SearchAndUserProfile}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused, size }) => (
            <Icon
              name="search"
              size={size}
              color={focused ? "black" : "grey"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyProfileAndEdit"
        component={MyProfileAndEdit}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused, size }) => (
            <Icon name="user" size={size} color={focused ? "black" : "grey"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkToken = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <ApolloProvider client={client}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: showHeader }}>
            {isLoggedIn ? (
              <Stack.Screen name="HomeTabs" component={HomeTabs} />
            ) : (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ApolloProvider>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
