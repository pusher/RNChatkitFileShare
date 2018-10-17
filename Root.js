import React, { Component } from "react";
import { createStackNavigator } from "react-navigation";

import Login from "./app/screens/Login";
import Chat from "./app/screens/Chat";

console.ignoredYellowBox = ["Setting a timer"];

const RootStack = createStackNavigator(
  {
    Login: Login,
    Chat: Chat
  },
  {
    initialRouteName: "Login"
  }
);

class Router extends Component {
  render() {
    return <RootStack />;
  }
}

export default Router;
