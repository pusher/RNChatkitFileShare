import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import stringHash from "string-hash";

const CHAT_SERVER = "YOUR_NGROK_URL/users";

export default class Login extends Component {
  static navigationOptions = {
    header: null
  };

  state = {
    username: "",
    friends_username: "",
    is_loading: false
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.main}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Enter your username</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={username => this.setState({ username })}
              value={this.state.username}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Enter friend's username</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={friends_username =>
                this.setState({ friends_username })
              }
              value={this.state.friends_username}
            />
          </View>

          {this.state.is_loading && (
            <ActivityIndicator size="small" color="#0064e1" />
          )}

          {!this.state.is_loading && (
            <TouchableOpacity onPress={this.login} style={styles.button}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  login = async () => {
    let username = this.state.username;
    let friends_username = this.state.friends_username;
    let user_id = stringHash(username).toString();

    this.setState({
      is_loading: true
    });

    if (username && friends_username) {
      let response = await fetch(CHAT_SERVER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user_id,
          username: username
        })
      });

      await this.setState({
        is_loading: false,
        username: "",
        friends_username: ""
      });

      if (response.ok) {
        this.props.navigation.navigate("Chat", {
          user_id,
          username,
          friends_username
        });
      } else {
        console.log("not ok");
      }
    }
  };
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF"
  },
  fieldContainer: {
    marginTop: 20
  },
  label: {
    fontSize: 16
  },
  textInput: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#eaeaea",
    padding: 5
  },
  button: {
    alignSelf: "center",
    marginTop: 10
  },
  buttonText: {
    fontSize: 18,
    color: "#05a5d1"
  }
};
