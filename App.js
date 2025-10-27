import * as React from 'react';
import {LogBox} from 'react-native';
LogBox.ignoreAllLogs(true);
import{ NavigationContainer} from "@react-navigation/native";
import{ createNativeStackNavigator} from "@react-navigation/native-stack";
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets,} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';


import Chat from "./screens/Chat";
import ChatLog from "./screens/ChatLog";
import CreatePost from "./screens/CreatePost";
import HomePage from "./screens/HomePage";
import Login from "./screens/Login";
import Profile from "./screens/Profile";
import Search from "./screens/Search";
import SignUp from "./screens/SignUp";
import Slots from "./screens/Slots";
import ViewPost from "./screens/ViewPost";
import WelcomePage from "./screens/WelcomePage";
import SearchResult from "./screens/SearchResult";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={"WelcomePage"}>
          <Stack.Screen name="Chat" component={Chat} options={{headerShown:false}}/>
          <Stack.Screen name="ChatLog" component={ChatLog} options={{headerShown:false}}/>
          <Stack.Screen name="CreatePost" component={CreatePost} options={{headerShown:false}}/>
          <Stack.Screen name="HomePage" component={HomePage} options={{headerShown:false}}/>
          <Stack.Screen name="Login" component={Login} options={{headerShown:false}}/>
          <Stack.Screen name="Profile" component={Profile} options={{headerShown:false}}/>
          <Stack.Screen name="Search" component={Search} options={{headerShown:false}}/>
          <Stack.Screen name="SignUp" component={SignUp} options={{headerShown:false}}/>
          <Stack.Screen name="Slots" component={Slots} options={{headerShown:false}}/>
          <Stack.Screen name="ViewPost" component={ViewPost} options={{headerShown:false}}/>
          <Stack.Screen name="WelcomePage" component={WelcomePage} options={{headerShown:false}}/>
          <Stack.Screen name="SearchResult" component={SearchResult} options={{headerShown:false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({})